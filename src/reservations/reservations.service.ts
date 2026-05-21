import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClientStatus, Prisma, PropertyStatus, Reservation, ReservationStatus } from '@prisma/client';
import { assertClientTransition } from '../clients/client-status.machine';
import { PrismaService } from '../prisma/prisma.service';
import { assertPropertyTransition } from '../properties/property-status.machine';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations.query';
import { assertReservationTransition } from './reservation-status.machine';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const property = await tx.property.findFirst({
        where: { id: dto.propertyId, deletedAt: null },
      });
      if (!property) throw new NotFoundException(`Inmueble no encontrado: ${dto.propertyId}`);
      if (property.status !== PropertyStatus.DISPONIBLE) {
        throw new BadRequestException(
          `Inmueble no disponible para reservar. Estado: ${property.status}`,
        );
      }

      const client = await tx.client.findFirst({
        where: { id: dto.clientId, deletedAt: null },
      });
      if (!client) throw new NotFoundException(`Cliente no encontrado: ${dto.clientId}`);
      if (client.status === ClientStatus.CERRADO) {
        throw new BadRequestException('Cliente CERRADO no puede reservar');
      }

      assertPropertyTransition(property.status, PropertyStatus.RESERVADO);
      if (client.status !== ClientStatus.RESERVADO) {
        assertClientTransition(client.status, ClientStatus.RESERVADO);
      }

      const reservationDate = new Date();
      const expiresAt = new Date(reservationDate.getTime() + dto.validityDays * 86_400_000);

      const reservation = await tx.reservation.create({
        data: {
          propertyId: dto.propertyId,
          clientId: dto.clientId,
          depositAmount: new Prisma.Decimal(dto.depositAmount),
          currency: dto.currency ?? 'BOB',
          validityDays: dto.validityDays,
          reservationDate,
          expiresAt,
          refundConditions: dto.refundConditions,
        },
      });

      await tx.property.update({
        where: { id: dto.propertyId },
        data: { status: PropertyStatus.RESERVADO },
      });
      await tx.client.update({
        where: { id: dto.clientId },
        data: { status: ClientStatus.RESERVADO },
      });

      return reservation;
    });
  }

  async list(q: ListReservationsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.ReservationWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.clientId && { clientId: q.clientId }),
      ...(q.propertyId && { propertyId: q.propertyId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.reservation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { reservationDate: 'desc' },
        include: { property: true, client: true },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Reservation> {
    const found = await this.prisma.reservation.findUnique({
      where: { id },
      include: { property: true, client: true },
    });
    if (!found) throw new NotFoundException(`Reserva no encontrada: ${id}`);
    return found;
  }

  async cancel(id: string): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const res = await tx.reservation.findUnique({ where: { id } });
      if (!res) throw new NotFoundException(`Reserva no encontrada: ${id}`);
      assertReservationTransition(res.status, ReservationStatus.CANCELADA);

      const updated = await tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.CANCELADA },
      });
      await tx.property.update({
        where: { id: res.propertyId },
        data: { status: PropertyStatus.DISPONIBLE },
      });
      await tx.client.update({
        where: { id: res.clientId },
        data: { status: ClientStatus.PROSPECTO },
      });
      return updated;
    });
  }

  async expireDueReservations(): Promise<{ expired: number }> {
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const due = await tx.reservation.findMany({
        where: { status: ReservationStatus.ACTIVA, expiresAt: { lt: now } },
      });
      for (const r of due) {
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: ReservationStatus.VENCIDA },
        });
        await tx.property.update({
          where: { id: r.propertyId },
          data: { status: PropertyStatus.DISPONIBLE },
        });
        await tx.client.update({
          where: { id: r.clientId },
          data: { status: ClientStatus.PROSPECTO },
        });
      }
      return { expired: due.length };
    });
  }
}

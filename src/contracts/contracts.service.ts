import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ClientStatus,
  Contract,
  ContractStatus,
  Prisma,
  PropertyStatus,
  ReservationStatus,
} from '@prisma/client';
import { assertClientTransition } from '../clients/client-status.machine';
import { PrismaService } from '../prisma/prisma.service';
import { assertPropertyTransition } from '../properties/property-status.machine';
import { assertReservationTransition } from '../reservations/reservation-status.machine';
import { assertContractTransition } from './contract-status.machine';
import { AmendContractDto } from './dto/amend-contract.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query';

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromReservation(dto: CreateContractDto): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: dto.reservationId },
      });
      if (!reservation) throw new NotFoundException(`Reserva no encontrada: ${dto.reservationId}`);
      if (reservation.status !== ReservationStatus.ACTIVA) {
        throw new BadRequestException(`Reserva no ACTIVA. Estado: ${reservation.status}`);
      }

      const existing = await tx.contract.findFirst({
        where: {
          propertyId: reservation.propertyId,
          clientId: reservation.clientId,
          deletedAt: null,
          status: { notIn: [ContractStatus.RESCINDIDO, ContractStatus.MODIFICADO] },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe contrato activo para esta propiedad/cliente: ${existing.id}`,
        );
      }

      return tx.contract.create({
        data: {
          propertyId: reservation.propertyId,
          clientId: reservation.clientId,
          totalAmount: new Prisma.Decimal(dto.totalAmount),
          currency: dto.currency ?? 'BOB',
          deliveryDeadline: dto.deliveryDeadline,
          specialClauses: (dto.specialClauses as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
          status: ContractStatus.BORRADOR,
        },
      });
    });
  }

  async list(q: ListContractsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.ContractWhereInput = {
      deletedAt: null,
      ...(q.status && { status: q.status }),
      ...(q.clientId && { clientId: q.clientId }),
      ...(q.propertyId && { propertyId: q.propertyId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Contract> {
    const found = await this.prisma.contract.findFirst({
      where: { id, deletedAt: null },
      include: { property: true, client: true, previousContract: true },
    });
    if (!found) throw new NotFoundException(`Contrato no encontrado: ${id}`);
    return found;
  }

  async submitForReview(id: string): Promise<Contract> {
    return this.transitionStatus(id, ContractStatus.REVISION);
  }

  async sign(id: string): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      const c = await tx.contract.findFirst({ where: { id, deletedAt: null } });
      if (!c) throw new NotFoundException(`Contrato no encontrado: ${id}`);
      assertContractTransition(c.status, ContractStatus.FIRMADO);

      const updated = await tx.contract.update({
        where: { id },
        data: {
          status: ContractStatus.FIRMADO,
          signedDate: new Date(),
        },
      });

      const property = await tx.property.findUniqueOrThrow({ where: { id: c.propertyId } });
      assertPropertyTransition(property.status, PropertyStatus.VENDIDO);
      await tx.property.update({
        where: { id: c.propertyId },
        data: { status: PropertyStatus.VENDIDO },
      });

      const client = await tx.client.findUniqueOrThrow({ where: { id: c.clientId } });
      if (client.status !== ClientStatus.FIRMADO) {
        assertClientTransition(client.status, ClientStatus.FIRMADO);
        await tx.client.update({ where: { id: c.clientId }, data: { status: ClientStatus.FIRMADO } });
      }

      const activeRes = await tx.reservation.findFirst({
        where: {
          propertyId: c.propertyId,
          clientId: c.clientId,
          status: ReservationStatus.ACTIVA,
        },
      });
      if (activeRes) {
        assertReservationTransition(activeRes.status, ReservationStatus.CONVERTIDA);
        await tx.reservation.update({
          where: { id: activeRes.id },
          data: { status: ReservationStatus.CONVERTIDA },
        });
      }

      return updated;
    });
  }

  async rescind(id: string): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      const c = await tx.contract.findFirst({ where: { id, deletedAt: null } });
      if (!c) throw new NotFoundException(`Contrato no encontrado: ${id}`);
      assertContractTransition(c.status, ContractStatus.RESCINDIDO);

      const updated = await tx.contract.update({
        where: { id },
        data: { status: ContractStatus.RESCINDIDO },
      });

      const property = await tx.property.findUniqueOrThrow({ where: { id: c.propertyId } });
      if (
        property.status === PropertyStatus.RESERVADO ||
        property.status === PropertyStatus.VENDIDO
      ) {
        await tx.property.update({
          where: { id: c.propertyId },
          data: { status: PropertyStatus.DISPONIBLE },
        });
      }

      return updated;
    });
  }

  async amend(id: string, dto: AmendContractDto): Promise<Contract> {
    return this.prisma.$transaction(async (tx) => {
      const prev = await tx.contract.findFirst({ where: { id, deletedAt: null } });
      if (!prev) throw new NotFoundException(`Contrato no encontrado: ${id}`);
      if (prev.status !== ContractStatus.FIRMADO) {
        throw new BadRequestException(`Solo se modifica contratos FIRMADO. Estado: ${prev.status}`);
      }
      if (prev.optimisticVersion !== dto.expectedOptimisticVersion) {
        throw new ConflictException(
          `Versión obsoleta. Actual: ${prev.optimisticVersion}, enviada: ${dto.expectedOptimisticVersion}`,
        );
      }

      await tx.contract.update({
        where: { id },
        data: { status: ContractStatus.MODIFICADO },
      });

      return tx.contract.create({
        data: {
          propertyId: prev.propertyId,
          clientId: prev.clientId,
          version: prev.version + 1,
          totalAmount:
            dto.totalAmount !== undefined ? new Prisma.Decimal(dto.totalAmount) : prev.totalAmount,
          currency: prev.currency,
          deliveryDeadline: dto.deliveryDeadline ?? prev.deliveryDeadline,
          specialClauses:
            dto.specialClauses !== undefined
              ? (dto.specialClauses as Prisma.InputJsonValue)
              : ((prev.specialClauses as Prisma.InputJsonValue | null) ?? Prisma.JsonNull),
          status: ContractStatus.FIRMADO,
          signedDate: new Date(),
          previousContractId: prev.id,
          optimisticVersion: 1,
        },
      });
    });
  }

  private async transitionStatus(id: string, to: ContractStatus): Promise<Contract> {
    const c = await this.findById(id);
    assertContractTransition(c.status, to);
    return this.prisma.contract.update({ where: { id }, data: { status: to } });
  }
}

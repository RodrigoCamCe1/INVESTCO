import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MaterialReception, POStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceptionDto } from './dto/create-reception.dto';
import { assertPOTransition } from './po-status.machine';

@Injectable()
export class ReceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    purchaseOrderId: string,
    dto: CreateReceptionDto,
    user: AuthenticatedUser,
  ): Promise<MaterialReception> {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: purchaseOrderId, deletedAt: null },
        include: { lines: { include: { receptions: true } } },
      });
      if (!po) throw new NotFoundException(`OC no encontrada: ${purchaseOrderId}`);
      if (po.status !== POStatus.ENVIADA && po.status !== POStatus.RECIBIDA_PARCIAL) {
        throw new BadRequestException(
          `Solo se puede recibir OC ENVIADA o RECIBIDA_PARCIAL. Estado: ${po.status}`,
        );
      }

      const line = po.lines.find((l) => l.id === dto.purchaseOrderLineId);
      if (!line) throw new NotFoundException(`Línea no pertenece a esta OC`);

      const receivedSoFar = line.receptions.reduce(
        (acc, r) => acc.plus(r.quantityReceived),
        new Prisma.Decimal(0),
      );
      const newReceived = receivedSoFar.plus(new Prisma.Decimal(dto.quantityReceived));
      if (newReceived.greaterThan(line.quantity)) {
        throw new BadRequestException(
          `Cantidad recibida excede pendiente. Línea pidió ${line.quantity.toString()}, recibido ya ${receivedSoFar.toString()}`,
        );
      }

      const reception = await tx.materialReception.create({
        data: {
          purchaseOrderId,
          purchaseOrderLineId: line.id,
          quantityReceived: new Prisma.Decimal(dto.quantityReceived),
          qualityNotes: dto.qualityNotes,
          receivedBy: user.id,
        },
      });

      const updated = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id: purchaseOrderId },
        include: { lines: { include: { receptions: true } } },
      });

      let allComplete = true;
      let anyReceived = false;
      for (const l of updated.lines) {
        const sum = l.receptions.reduce(
          (acc, r) => acc.plus(r.quantityReceived),
          new Prisma.Decimal(0),
        );
        if (sum.greaterThan(0)) anyReceived = true;
        if (!sum.equals(l.quantity)) allComplete = false;
      }

      const nextStatus: POStatus = allComplete
        ? POStatus.RECIBIDA_TOTAL
        : anyReceived
          ? POStatus.RECIBIDA_PARCIAL
          : po.status;

      if (nextStatus !== po.status) {
        assertPOTransition(po.status, nextStatus);
        await tx.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: nextStatus } });
      }

      return reception;
    });
  }

  async list(purchaseOrderId: string) {
    return this.prisma.materialReception.findMany({
      where: { purchaseOrderId },
      orderBy: { receivedDate: 'desc' },
      include: { purchaseOrderLine: { include: { material: true } } },
    });
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { POStatus, Prisma, PurchaseOrder } from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoDto } from './dto/create-po.dto';
import { ListPosQueryDto } from './dto/list-pos.query';
import { assertPOTransition } from './po-status.machine';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePoDto): Promise<PurchaseOrder> {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({ where: { id: dto.projectId, deletedAt: null } });
      if (!project) throw new NotFoundException(`Proyecto no encontrado: ${dto.projectId}`);
      const supplier = await tx.supplier.findUnique({ where: { id: dto.supplierId } });
      if (!supplier) throw new NotFoundException(`Proveedor no encontrado: ${dto.supplierId}`);
      if (!supplier.isActive) throw new BadRequestException('Proveedor inactivo');

      const materialIds = dto.lines.map((l) => l.materialId);
      const dupCheck = new Set(materialIds);
      if (dupCheck.size !== materialIds.length) {
        throw new BadRequestException('Líneas con material duplicado');
      }
      const materials = await tx.material.findMany({ where: { id: { in: materialIds }, isActive: true } });
      if (materials.length !== materialIds.length) {
        throw new BadRequestException('Algún material no existe o está inactivo');
      }

      let total = new Prisma.Decimal(0);
      const linesData = dto.lines.map((l) => {
        const lineTotal = new Prisma.Decimal(l.quantity).times(new Prisma.Decimal(l.unitPrice));
        total = total.plus(lineTotal);
        return {
          materialId: l.materialId,
          quantity: new Prisma.Decimal(l.quantity),
          unitPrice: new Prisma.Decimal(l.unitPrice),
          lineTotal,
        };
      });

      return tx.purchaseOrder.create({
        data: {
          projectId: dto.projectId,
          supplierId: dto.supplierId,
          currency: dto.currency ?? 'BOB',
          totalAmount: total,
          lines: { create: linesData },
        },
        include: { lines: true, supplier: true },
      });
    });
  }

  async list(q: ListPosQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.PurchaseOrderWhereInput = {
      deletedAt: null,
      ...(q.status && { status: q.status }),
      ...(q.projectId && { projectId: q.projectId }),
      ...(q.supplierId && { supplierId: q.supplierId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: { supplier: true, lines: { include: { material: true } } },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const found = await this.prisma.purchaseOrder.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplier: true,
        lines: { include: { material: true, receptions: true } },
        receptions: true,
      },
    });
    if (!found) throw new NotFoundException(`OC no encontrada: ${id}`);
    return found;
  }

  async transition(id: string, to: POStatus, user: AuthenticatedUser): Promise<PurchaseOrder> {
    return this.prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findFirst({ where: { id, deletedAt: null } });
      if (!po) throw new NotFoundException(`OC no encontrada: ${id}`);
      assertPOTransition(po.status, to);

      const data: Prisma.PurchaseOrderUpdateInput = { status: to };
      if (to === POStatus.APROBADA) {
        data.approvedBy = user.id;
        data.approvedAt = new Date();
      }
      if (to === POStatus.ENVIADA) {
        data.sentAt = new Date();
      }
      return tx.purchaseOrder.update({ where: { id }, data });
    });
  }
}

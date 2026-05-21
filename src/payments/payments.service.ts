import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment, PaymentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.query';
import { assertPaymentFKs } from './payment.rules';

export interface PaymentsSummary {
  projectId?: string;
  contractTotal: number | null;
  inflows: { type: PaymentType; total: number }[];
  outflows: { type: PaymentType; total: number }[];
  totalIn: number;
  totalOut: number;
  net: number;
  pendingFromContract: number | null;
}

const INFLOWS: PaymentType[] = ['DESEMBOLSO_BANCO', 'PAGO_CLIENTE'];
const OUTFLOWS: PaymentType[] = ['PAGO_PROVEEDOR', 'PAGO_CONTRATISTA', 'REEMBOLSO'];

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    assertPaymentFKs(dto.type, {
      projectId: dto.projectId,
      contractId: dto.contractId,
      clientId: dto.clientId,
      supplierId: dto.supplierId,
      contractorWorkerId: dto.contractorWorkerId,
    });
    await this.assertFKsExist(dto);

    return this.prisma.payment.create({
      data: {
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount),
        currency: dto.currency ?? 'BOB',
        paymentDate: dto.paymentDate,
        reference: dto.reference,
        projectId: dto.projectId,
        contractId: dto.contractId,
        clientId: dto.clientId,
        supplierId: dto.supplierId,
        contractorWorkerId: dto.contractorWorkerId,
      },
    });
  }

  async list(q: ListPaymentsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.PaymentWhereInput = {
      ...(q.type && { type: q.type }),
      ...(q.projectId && { projectId: q.projectId }),
      ...(q.clientId && { clientId: q.clientId }),
      ...(q.supplierId && { supplierId: q.supplierId }),
      ...(q.from || q.to
        ? {
            paymentDate: {
              ...(q.from && { gte: q.from }),
              ...(q.to && { lte: q.to }),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Payment> {
    const found = await this.prisma.payment.findUnique({
      where: { id },
      include: { project: true, contract: true, client: true, supplier: true, contractorWorker: true },
    });
    if (!found) throw new NotFoundException(`Pago no encontrado: ${id}`);
    return found;
  }

  async projectSummary(projectId: string): Promise<PaymentsSummary> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      include: { contract: true },
    });
    if (!project) throw new NotFoundException(`Proyecto no encontrado: ${projectId}`);

    const grouped = await this.prisma.payment.groupBy({
      by: ['type'],
      where: { projectId },
      _sum: { amount: true },
    });

    const totalsByType = new Map<PaymentType, number>();
    for (const g of grouped) {
      totalsByType.set(g.type, Number(g._sum.amount ?? 0));
    }

    const inflows = INFLOWS.map((t) => ({ type: t, total: totalsByType.get(t) ?? 0 })).filter(
      (r) => r.total > 0,
    );
    const outflows = OUTFLOWS.map((t) => ({ type: t, total: totalsByType.get(t) ?? 0 })).filter(
      (r) => r.total > 0,
    );

    const totalIn = inflows.reduce((acc, r) => acc + r.total, 0);
    const totalOut = outflows.reduce((acc, r) => acc + r.total, 0);
    const net = Math.round((totalIn - totalOut) * 100) / 100;
    const contractTotal = project.contract ? Number(project.contract.totalAmount) : null;
    const pendingFromContract =
      contractTotal !== null ? Math.round((contractTotal - totalIn) * 100) / 100 : null;

    return {
      projectId,
      contractTotal,
      inflows,
      outflows,
      totalIn: Math.round(totalIn * 100) / 100,
      totalOut: Math.round(totalOut * 100) / 100,
      net,
      pendingFromContract,
    };
  }

  private async assertFKsExist(dto: CreatePaymentDto): Promise<void> {
    if (dto.projectId) {
      const p = await this.prisma.project.findFirst({
        where: { id: dto.projectId, deletedAt: null },
      });
      if (!p) throw new NotFoundException(`Proyecto no encontrado: ${dto.projectId}`);
    }
    if (dto.contractId) {
      const c = await this.prisma.contract.findFirst({
        where: { id: dto.contractId, deletedAt: null },
      });
      if (!c) throw new NotFoundException(`Contrato no encontrado: ${dto.contractId}`);
    }
    if (dto.clientId) {
      const c = await this.prisma.client.findFirst({
        where: { id: dto.clientId, deletedAt: null },
      });
      if (!c) throw new NotFoundException(`Cliente no encontrado: ${dto.clientId}`);
    }
    if (dto.supplierId) {
      const s = await this.prisma.supplier.findUnique({ where: { id: dto.supplierId } });
      if (!s) throw new NotFoundException(`Proveedor no encontrado: ${dto.supplierId}`);
    }
    if (dto.contractorWorkerId) {
      const w = await this.prisma.worker.findUnique({ where: { id: dto.contractorWorkerId } });
      if (!w) throw new NotFoundException(`Worker no encontrado: ${dto.contractorWorkerId}`);
    }
  }
}

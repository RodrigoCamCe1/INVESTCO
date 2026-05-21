import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreditCheck, Prisma } from '@prisma/client';
import { BANK_PORT, BankPort } from '../integrations/bank/bank.port';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCreditCheckDto } from './dto/create-credit-check.dto';

@Injectable()
export class CreditChecksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(BANK_PORT) private readonly bank: BankPort,
  ) {}

  async run(clientId: string, dto: CreateCreditCheckDto): Promise<CreditCheck> {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, deletedAt: null },
    });
    if (!client) throw new NotFoundException(`Cliente no encontrado: ${clientId}`);

    const result = await this.bank.checkCredit({
      clientCi: client.ci,
      clientFullName: `${client.firstName} ${client.lastName}`,
      bankName: dto.bankName,
      requestedAmount: dto.requestedAmount,
    });

    return this.prisma.creditCheck.create({
      data: {
        clientId,
        bankName: dto.bankName,
        status: result.status,
        approvedAmount:
          result.status === 'APROBADO' ? new Prisma.Decimal(result.approvedAmount) : null,
        checkDate: new Date(),
        notes: result.notes,
      },
    });
  }

  async list(clientId: string): Promise<CreditCheck[]> {
    return this.prisma.creditCheck.findMany({
      where: { clientId },
      orderBy: { checkDate: 'desc' },
    });
  }
}

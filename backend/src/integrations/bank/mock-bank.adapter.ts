import { Injectable, Logger } from '@nestjs/common';
import { BankPort, CreditCheckRequest, CreditCheckResult } from './bank.port';

@Injectable()
export class MockBankAdapter implements BankPort {
  private readonly logger = new Logger('MockBank');

  async checkCredit(req: CreditCheckRequest): Promise<CreditCheckResult> {
    await this.simulateNetwork();
    this.logger.warn(`[MOCK] Verificación crédito banco=${req.bankName} CI=${req.clientCi}`);

    const requested = req.requestedAmount ?? 100_000;
    const seed = this.hash(req.clientCi);
    const outcome = seed % 10;

    if (outcome < 6) {
      const factor = 0.6 + (seed % 50) / 100;
      const approvedAmount = Math.round(requested * factor);
      return {
        status: 'APROBADO',
        approvedAmount,
        notes: `[MOCK] Aprobado por ${req.bankName}. Tasa simulada ${(seed % 8) + 6}% anual.`,
      };
    }
    if (outcome < 8) {
      return { status: 'PENDIENTE', notes: '[MOCK] Pendiente verificación documentos' };
    }
    return { status: 'RECHAZADO', notes: '[MOCK] Score insuficiente' };
  }

  private async simulateNetwork(): Promise<void> {
    await new Promise((r) => setTimeout(r, 50));
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
}

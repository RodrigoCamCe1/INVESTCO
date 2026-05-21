export interface CreditCheckRequest {
  clientCi: string;
  clientFullName: string;
  bankName: string;
  requestedAmount?: number;
}

export type CreditCheckResult =
  | { status: 'APROBADO'; approvedAmount: number; notes?: string }
  | { status: 'RECHAZADO'; notes?: string }
  | { status: 'PENDIENTE'; notes?: string };

export interface BankPort {
  checkCredit(req: CreditCheckRequest): Promise<CreditCheckResult>;
}

export const BANK_PORT = Symbol('BANK_PORT');

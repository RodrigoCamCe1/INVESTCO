import { BadRequestException } from '@nestjs/common';
import { PaymentType } from '@prisma/client';

export interface PaymentFKs {
  projectId?: string;
  contractId?: string;
  clientId?: string;
  supplierId?: string;
  contractorWorkerId?: string;
}

interface Rule {
  required: (keyof PaymentFKs)[];
  forbidden?: (keyof PaymentFKs)[];
}

const RULES: Record<PaymentType, Rule> = {
  DESEMBOLSO_BANCO: { required: ['contractId'] },
  PAGO_CLIENTE: { required: ['clientId'] },
  PAGO_PROVEEDOR: { required: ['supplierId'] },
  PAGO_CONTRATISTA: { required: ['contractorWorkerId'] },
  REEMBOLSO: { required: ['clientId'] },
};

export function assertPaymentFKs(type: PaymentType, fks: PaymentFKs): void {
  const rule = RULES[type];
  for (const f of rule.required) {
    if (!fks[f]) {
      throw new BadRequestException(`Pago tipo ${type} requiere ${f}`);
    }
  }
  if (rule.forbidden) {
    for (const f of rule.forbidden) {
      if (fks[f]) {
        throw new BadRequestException(`Pago tipo ${type} no acepta ${f}`);
      }
    }
  }
}

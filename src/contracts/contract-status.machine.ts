import { BadRequestException } from '@nestjs/common';
import { ContractStatus } from '@prisma/client';

const TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  BORRADOR: ['REVISION', 'RESCINDIDO'],
  REVISION: ['BORRADOR', 'FIRMADO', 'RESCINDIDO'],
  FIRMADO: ['MODIFICADO', 'RESCINDIDO'],
  MODIFICADO: [],
  RESCINDIDO: [],
};

export function assertContractTransition(from: ContractStatus, to: ContractStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida contrato: ${from} → ${to}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

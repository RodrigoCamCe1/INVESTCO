import { BadRequestException } from '@nestjs/common';
import { FindingStatus } from '@prisma/client';

const TRANSITIONS: Record<FindingStatus, FindingStatus[]> = {
  ABIERTA: ['EN_CORRECCION', 'RECHAZADA'],
  EN_CORRECCION: ['RESUELTA', 'RECHAZADA', 'ABIERTA'],
  RESUELTA: [],
  RECHAZADA: [],
};

export function assertFindingTransition(from: FindingStatus, to: FindingStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida finding: ${from} → ${to}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

import { BadRequestException } from '@nestjs/common';
import { POStatus } from '@prisma/client';

const TRANSITIONS: Record<POStatus, POStatus[]> = {
  BORRADOR: ['EN_APROBACION', 'CANCELADA'],
  EN_APROBACION: ['APROBADA', 'BORRADOR', 'CANCELADA'],
  APROBADA: ['ENVIADA', 'CANCELADA'],
  ENVIADA: ['RECIBIDA_PARCIAL', 'RECIBIDA_TOTAL', 'CANCELADA'],
  RECIBIDA_PARCIAL: ['RECIBIDA_TOTAL'],
  RECIBIDA_TOTAL: [],
  CANCELADA: [],
};

export function assertPOTransition(from: POStatus, to: POStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida OC: ${from} → ${to}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

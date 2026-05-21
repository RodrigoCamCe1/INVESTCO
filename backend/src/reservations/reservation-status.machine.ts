import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';

const TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  ACTIVA: ['VENCIDA', 'CONVERTIDA', 'CANCELADA'],
  VENCIDA: [],
  CONVERTIDA: [],
  CANCELADA: [],
};

export function assertReservationTransition(from: ReservationStatus, to: ReservationStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida reserva: ${from} → ${to}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

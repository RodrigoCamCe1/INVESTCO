import { BadRequestException } from '@nestjs/common';
import { PropertyStatus } from '@prisma/client';

const TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  DISPONIBLE: ['RESERVADO'],
  RESERVADO: ['DISPONIBLE', 'VENDIDO'],
  VENDIDO: ['EN_CONSTRUCCION'],
  EN_CONSTRUCCION: ['ENTREGADO'],
  ENTREGADO: [],
};

export function assertPropertyTransition(from: PropertyStatus, to: PropertyStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida: ${from} → ${to}. Permitidas desde ${from}: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

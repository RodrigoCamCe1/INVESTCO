import { BadRequestException } from '@nestjs/common';
import { ClientStatus } from '@prisma/client';

const TRANSITIONS: Record<ClientStatus, ClientStatus[]> = {
  LEAD: ['PROSPECTO', 'RESERVADO', 'CERRADO'],
  PROSPECTO: ['RESERVADO', 'LEAD', 'CERRADO'],
  RESERVADO: ['FIRMADO', 'PROSPECTO', 'CERRADO'],
  FIRMADO: ['ENTREGADO', 'CERRADO'],
  ENTREGADO: ['CERRADO'],
  CERRADO: [],
};

export function assertClientTransition(from: ClientStatus, to: ClientStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida cliente: ${from} → ${to}. Permitidas desde ${from}: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

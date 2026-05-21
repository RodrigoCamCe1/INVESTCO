import { BadRequestException } from '@nestjs/common';
import { ProjectStage, ProjectStatus } from '@prisma/client';

const STATUS: Record<ProjectStatus, ProjectStatus[]> = {
  PLANIFICADO: ['EN_EJECUCION', 'CANCELADO'],
  EN_EJECUCION: ['PAUSADO', 'FINALIZADO', 'CANCELADO'],
  PAUSADO: ['EN_EJECUCION', 'CANCELADO'],
  FINALIZADO: [],
  CANCELADO: [],
};

const STAGE: Record<ProjectStage, ProjectStage[]> = {
  PRELIMINARES: ['OBRA_BRUTA'],
  OBRA_BRUTA: ['OBRA_FINA'],
  OBRA_FINA: ['ENTREGA'],
  ENTREGA: [],
};

export function assertProjectStatusTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (from === to) return;
  const allowed = STATUS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida proyecto status: ${from} → ${to}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

export function assertProjectStageTransition(from: ProjectStage, to: ProjectStage): void {
  if (from === to) return;
  const allowed = STAGE[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException(
      `Transición inválida proyecto stage: ${from} → ${to}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
    );
  }
}

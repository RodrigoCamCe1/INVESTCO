import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, ActivityStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ProjectsService } from './projects.service';

const TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  PENDIENTE: ['EN_CURSO', 'BLOQUEADA'],
  EN_CURSO: ['TERMINADA', 'BLOQUEADA'],
  BLOQUEADA: ['PENDIENTE', 'EN_CURSO'],
  TERMINADA: [],
};

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateActivityDto): Promise<Activity> {
    await this.projects.assertExists(projectId);
    if (dto.plannedEnd.getTime() < dto.plannedStart.getTime()) {
      throw new BadRequestException('plannedEnd debe ser >= plannedStart');
    }

    return this.prisma.activity.create({
      data: {
        projectId,
        stage: dto.stage,
        category: dto.category,
        name: dto.name,
        plannedStart: dto.plannedStart,
        plannedEnd: dto.plannedEnd,
        plannedQuantity: dto.plannedQuantity ? new Prisma.Decimal(dto.plannedQuantity) : null,
        unit: dto.unit,
        unitPrice: dto.unitPrice ? new Prisma.Decimal(dto.unitPrice) : null,
        totalPlannedCost: dto.totalPlannedCost ? new Prisma.Decimal(dto.totalPlannedCost) : null,
        contractorWorkerId: dto.contractorWorkerId,
        weight: dto.weight ? new Prisma.Decimal(dto.weight) : new Prisma.Decimal(1),
      },
    });
  }

  async list(projectId: string): Promise<Activity[]> {
    await this.projects.assertExists(projectId);
    return this.prisma.activity.findMany({
      where: { projectId },
      orderBy: [{ stage: 'asc' }, { plannedStart: 'asc' }],
    });
  }

  async findOne(projectId: string, activityId: string): Promise<Activity> {
    const found = await this.prisma.activity.findFirst({
      where: { id: activityId, projectId },
      include: { progresses: { orderBy: { reportDate: 'desc' } } },
    });
    if (!found) throw new NotFoundException(`Activity no encontrada: ${activityId}`);
    return found;
  }

  async update(projectId: string, activityId: string, dto: UpdateActivityDto): Promise<Activity> {
    const current = await this.findOne(projectId, activityId);

    if (dto.status && dto.status !== current.status) {
      const allowed = TRANSITIONS[current.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transición inválida activity: ${current.status} → ${dto.status}. Permitidas: ${allowed.join(', ') || '(ninguna)'}`,
        );
      }
    }

    if (dto.plannedStart && dto.plannedEnd && dto.plannedEnd.getTime() < dto.plannedStart.getTime()) {
      throw new BadRequestException('plannedEnd debe ser >= plannedStart');
    }

    return this.prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.plannedStart !== undefined && { plannedStart: dto.plannedStart }),
        ...(dto.plannedEnd !== undefined && { plannedEnd: dto.plannedEnd }),
        ...(dto.actualStart !== undefined && { actualStart: dto.actualStart }),
        ...(dto.actualEnd !== undefined && { actualEnd: dto.actualEnd }),
        ...(dto.plannedQuantity !== undefined && { plannedQuantity: new Prisma.Decimal(dto.plannedQuantity) }),
        ...(dto.unitPrice !== undefined && { unitPrice: new Prisma.Decimal(dto.unitPrice) }),
        ...(dto.totalPlannedCost !== undefined && { totalPlannedCost: new Prisma.Decimal(dto.totalPlannedCost) }),
        ...(dto.contractorWorkerId !== undefined && { contractorWorkerId: dto.contractorWorkerId }),
        ...(dto.weight !== undefined && { weight: new Prisma.Decimal(dto.weight) }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(projectId: string, activityId: string): Promise<{ id: string }> {
    const found = await this.findOne(projectId, activityId);
    if (found.status !== ActivityStatus.PENDIENTE) {
      throw new BadRequestException(
        `Solo se elimina activities PENDIENTE. Estado: ${found.status}`,
      );
    }
    await this.prisma.activity.delete({ where: { id: activityId } });
    return { id: activityId };
  }
}

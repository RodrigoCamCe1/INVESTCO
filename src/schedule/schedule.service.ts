import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleDependency, ScheduleItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async createItem(projectId: string, dto: CreateScheduleItemDto): Promise<ScheduleItem> {
    await this.projects.assertExists(projectId);
    if (dto.plannedEnd.getTime() < dto.plannedStart.getTime()) {
      throw new BadRequestException('plannedEnd debe ser >= plannedStart');
    }
    if (dto.activityId) {
      const a = await this.prisma.activity.findFirst({
        where: { id: dto.activityId, projectId },
      });
      if (!a) throw new NotFoundException('Activity no pertenece al proyecto');
    }
    return this.prisma.scheduleItem.create({
      data: {
        projectId,
        name: dto.name,
        plannedStart: dto.plannedStart,
        plannedEnd: dto.plannedEnd,
        activityId: dto.activityId,
      },
    });
  }

  async listItems(projectId: string) {
    await this.projects.assertExists(projectId);
    return this.prisma.scheduleItem.findMany({
      where: { projectId },
      include: {
        predecessors: { include: { predecessor: true } },
        successors: { include: { successor: true } },
      },
      orderBy: { plannedStart: 'asc' },
    });
  }

  async updateItem(projectId: string, id: string, dto: UpdateScheduleItemDto): Promise<ScheduleItem> {
    const found = await this.prisma.scheduleItem.findFirst({ where: { id, projectId } });
    if (!found) throw new NotFoundException(`ScheduleItem no encontrado: ${id}`);

    if (dto.plannedStart && dto.plannedEnd && dto.plannedEnd.getTime() < dto.plannedStart.getTime()) {
      throw new BadRequestException('plannedEnd debe ser >= plannedStart');
    }

    return this.prisma.scheduleItem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.plannedStart !== undefined && { plannedStart: dto.plannedStart }),
        ...(dto.plannedEnd !== undefined && { plannedEnd: dto.plannedEnd }),
        ...(dto.actualStart !== undefined && { actualStart: dto.actualStart }),
        ...(dto.actualEnd !== undefined && { actualEnd: dto.actualEnd }),
        ...(dto.activityId !== undefined && { activityId: dto.activityId }),
      },
    });
  }

  async deleteItem(projectId: string, id: string): Promise<{ id: string }> {
    const found = await this.prisma.scheduleItem.findFirst({ where: { id, projectId } });
    if (!found) throw new NotFoundException(`ScheduleItem no encontrado: ${id}`);
    await this.prisma.$transaction([
      this.prisma.scheduleDependency.deleteMany({
        where: { OR: [{ predecessorId: id }, { successorId: id }] },
      }),
      this.prisma.scheduleItem.delete({ where: { id } }),
    ]);
    return { id };
  }

  async addDependency(projectId: string, dto: CreateDependencyDto): Promise<ScheduleDependency> {
    if (dto.predecessorId === dto.successorId) {
      throw new BadRequestException('Predecessor y successor no pueden ser el mismo');
    }
    const items = await this.prisma.scheduleItem.findMany({
      where: { id: { in: [dto.predecessorId, dto.successorId] }, projectId },
    });
    if (items.length !== 2) throw new NotFoundException('Predecessor o successor no pertenece al proyecto');

    if (await this.wouldCreateCycle(dto.predecessorId, dto.successorId)) {
      throw new BadRequestException('Dependencia crearía ciclo en el grafo');
    }

    try {
      return await this.prisma.scheduleDependency.create({
        data: {
          predecessorId: dto.predecessorId,
          successorId: dto.successorId,
          type: dto.type ?? 'FS',
          lagDays: dto.lagDays ?? 0,
        },
      });
    } catch {
      throw new ConflictException('Dependencia ya existe entre esos items');
    }
  }

  async removeDependency(projectId: string, depId: string): Promise<{ id: string }> {
    const dep = await this.prisma.scheduleDependency.findUnique({
      where: { id: depId },
      include: { predecessor: true },
    });
    if (!dep || dep.predecessor.projectId !== projectId) {
      throw new NotFoundException(`Dependencia no encontrada: ${depId}`);
    }
    await this.prisma.scheduleDependency.delete({ where: { id: depId } });
    return { id: depId };
  }

  private async wouldCreateCycle(predecessorId: string, successorId: string): Promise<boolean> {
    const visited = new Set<string>();
    const stack = [successorId];
    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === predecessorId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const nexts = await this.prisma.scheduleDependency.findMany({
        where: { predecessorId: current },
        select: { successorId: true },
      });
      for (const n of nexts) stack.push(n.successorId);
    }
    return false;
  }
}

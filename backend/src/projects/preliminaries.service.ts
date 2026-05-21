import { Injectable, NotFoundException } from '@nestjs/common';
import { Preliminary } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompletePreliminaryDto } from './dto/complete-preliminary.dto';
import { CreatePreliminaryDto } from './dto/create-preliminary.dto';
import { ProjectsService } from './projects.service';

@Injectable()
export class PreliminariesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreatePreliminaryDto): Promise<Preliminary> {
    await this.projects.assertExists(projectId);
    return this.prisma.preliminary.create({
      data: {
        projectId,
        type: dto.type,
        description: dto.description,
        notes: dto.notes,
      },
    });
  }

  async list(projectId: string): Promise<Preliminary[]> {
    await this.projects.assertExists(projectId);
    return this.prisma.preliminary.findMany({
      where: { projectId },
      orderBy: { type: 'asc' },
    });
  }

  async complete(projectId: string, id: string, dto: CompletePreliminaryDto): Promise<Preliminary> {
    const found = await this.prisma.preliminary.findFirst({ where: { id, projectId } });
    if (!found) throw new NotFoundException(`Preliminary no encontrada: ${id}`);
    return this.prisma.preliminary.update({
      where: { id },
      data: {
        completedAt: found.completedAt ?? new Date(),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(projectId: string, id: string): Promise<{ id: string }> {
    const found = await this.prisma.preliminary.findFirst({ where: { id, projectId } });
    if (!found) throw new NotFoundException(`Preliminary no encontrada: ${id}`);
    await this.prisma.preliminary.delete({ where: { id } });
    return { id };
  }
}

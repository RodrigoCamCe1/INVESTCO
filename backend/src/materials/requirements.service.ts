import { Injectable, NotFoundException } from '@nestjs/common';
import { MaterialRequirement, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UpsertRequirementDto } from './dto/upsert-requirement.dto';

@Injectable()
export class RequirementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async upsert(projectId: string, dto: UpsertRequirementDto): Promise<MaterialRequirement> {
    await this.projects.assertExists(projectId);
    const material = await this.prisma.material.findUnique({ where: { id: dto.materialId } });
    if (!material) throw new NotFoundException(`Material no encontrado: ${dto.materialId}`);

    const plannedTotal = new Prisma.Decimal(dto.plannedQuantity).times(
      new Prisma.Decimal(dto.plannedUnitPrice),
    );

    return this.prisma.materialRequirement.upsert({
      where: { projectId_materialId: { projectId, materialId: dto.materialId } },
      update: {
        plannedQuantity: new Prisma.Decimal(dto.plannedQuantity),
        plannedUnitPrice: new Prisma.Decimal(dto.plannedUnitPrice),
        plannedTotal,
      },
      create: {
        projectId,
        materialId: dto.materialId,
        plannedQuantity: new Prisma.Decimal(dto.plannedQuantity),
        plannedUnitPrice: new Prisma.Decimal(dto.plannedUnitPrice),
        plannedTotal,
      },
    });
  }

  async list(projectId: string) {
    await this.projects.assertExists(projectId);
    return this.prisma.materialRequirement.findMany({
      where: { projectId },
      include: { material: true },
      orderBy: { material: { code: 'asc' } },
    });
  }

  async remove(projectId: string, requirementId: string): Promise<{ id: string }> {
    const found = await this.prisma.materialRequirement.findFirst({
      where: { id: requirementId, projectId },
    });
    if (!found) throw new NotFoundException(`Requirement no encontrado: ${requirementId}`);
    await this.prisma.materialRequirement.delete({ where: { id: requirementId } });
    return { id: requirementId };
  }
}

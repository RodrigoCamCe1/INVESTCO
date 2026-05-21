import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityStatus, MaterialUsage, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateUsageDto } from './dto/create-usage.dto';

export interface MaterialAnalysisRow {
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  plannedQty: number;
  usedQty: number;
  remainingQty: number;
  plannedTotal: number;
  consumedPercent: number;
}

export interface ConsumptionAnalysis {
  projectId: string;
  weightedProgressPercent: number;
  rows: MaterialAnalysisRow[];
  warnings: string[];
}

@Injectable()
export class UsagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateUsageDto, user: AuthenticatedUser): Promise<MaterialUsage> {
    await this.projects.assertExists(projectId);
    const material = await this.prisma.material.findUnique({ where: { id: dto.materialId } });
    if (!material) throw new NotFoundException(`Material no encontrado: ${dto.materialId}`);

    if (dto.activityId) {
      const activity = await this.prisma.activity.findFirst({
        where: { id: dto.activityId, projectId },
      });
      if (!activity) throw new NotFoundException(`Activity no pertenece al proyecto`);
      if (activity.status === ActivityStatus.BLOQUEADA) {
        throw new BadRequestException('Activity BLOQUEADA no acepta consumo');
      }
    }

    return this.prisma.materialUsage.create({
      data: {
        projectId,
        materialId: dto.materialId,
        quantityUsed: new Prisma.Decimal(dto.quantityUsed),
        activityId: dto.activityId,
        reportedBy: user.id,
      },
    });
  }

  async list(projectId: string) {
    await this.projects.assertExists(projectId);
    return this.prisma.materialUsage.findMany({
      where: { projectId },
      include: { material: true, activity: true },
      orderBy: { usageDate: 'desc' },
    });
  }

  async analyze(projectId: string): Promise<ConsumptionAnalysis> {
    await this.projects.assertExists(projectId);

    const [requirements, usages, activities] = await Promise.all([
      this.prisma.materialRequirement.findMany({
        where: { projectId },
        include: { material: true },
      }),
      this.prisma.materialUsage.groupBy({
        by: ['materialId'],
        where: { projectId },
        _sum: { quantityUsed: true },
      }),
      this.prisma.activity.findMany({
        where: { projectId },
        include: { progresses: { orderBy: { reportDate: 'desc' }, take: 1 } },
      }),
    ]);

    const usedByMaterial = new Map<string, number>(
      usages.map((u) => [u.materialId, Number(u._sum.quantityUsed ?? 0)]),
    );

    const weightedProgressPercent = this.computeWeighted(activities);

    const rows: MaterialAnalysisRow[] = requirements.map((r) => {
      const planned = Number(r.plannedQuantity);
      const used = usedByMaterial.get(r.materialId) ?? 0;
      const remaining = planned - used;
      const consumedPercent = planned === 0 ? 0 : Math.round((used / planned) * 10000) / 100;
      return {
        materialId: r.materialId,
        materialCode: r.material.code,
        materialName: r.material.name,
        unit: r.material.unit,
        plannedQty: planned,
        usedQty: used,
        remainingQty: remaining,
        plannedTotal: Number(r.plannedTotal),
        consumedPercent,
      };
    });

    const warnings: string[] = [];
    for (const r of rows) {
      if (r.consumedPercent > 100) {
        warnings.push(`SOBRECONSUMO ${r.materialCode}: ${r.consumedPercent}% (excedió planificado)`);
      } else if (r.consumedPercent > weightedProgressPercent + 15) {
        warnings.push(
          `DESVIACION ${r.materialCode}: consumo ${r.consumedPercent}% vs avance ${weightedProgressPercent}%`,
        );
      }
    }

    return {
      projectId,
      weightedProgressPercent,
      rows,
      warnings,
    };
  }

  private computeWeighted(activities: Array<{ weight: Prisma.Decimal; status: ActivityStatus; progresses: { percentComplete: Prisma.Decimal }[] }>): number {
    if (activities.length === 0) return 0;
    const totalWeight = activities.reduce((acc, a) => acc + Number(a.weight), 0);
    if (totalWeight === 0) return 0;
    const sum = activities.reduce((acc, a) => {
      const pct =
        a.status === ActivityStatus.TERMINADA
          ? 100
          : a.progresses.length > 0
            ? Number(a.progresses[0].percentComplete)
            : 0;
      return acc + Number(a.weight) * pct;
    }, 0);
    return Math.round((sum / totalWeight) * 100) / 100;
  }
}

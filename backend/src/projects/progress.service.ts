import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Activity, ActivityProgress, ActivityStage, ActivityStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ReportProgressDto } from './dto/report-progress.dto';
import { ProjectsService } from './projects.service';

export interface ProjectProgressSummary {
  projectId: string;
  weightedPercent: number;
  byStage: { stage: ActivityStage; weightedPercent: number; activities: number }[];
  activities: Array<{
    id: string;
    name: string;
    stage: ActivityStage;
    weight: number;
    percentComplete: number;
    status: ActivityStatus;
  }>;
}

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async report(
    projectId: string,
    activityId: string,
    dto: ReportProgressDto,
    user: AuthenticatedUser,
  ): Promise<ActivityProgress> {
    await this.projects.assertExists(projectId);
    return this.prisma.$transaction(async (tx) => {
      const activity = await tx.activity.findFirst({
        where: { id: activityId, projectId },
      });
      if (!activity) throw new NotFoundException(`Activity no encontrada: ${activityId}`);
      if (activity.status === ActivityStatus.TERMINADA) {
        throw new BadRequestException('Activity TERMINADA no acepta más reportes');
      }
      if (activity.status === ActivityStatus.BLOQUEADA) {
        throw new BadRequestException('Activity BLOQUEADA no acepta reportes');
      }

      const latest = await tx.activityProgress.findFirst({
        where: { activityId },
        orderBy: { reportDate: 'desc' },
      });
      if (latest && Number(latest.percentComplete) > dto.percentComplete) {
        throw new BadRequestException(
          `percentComplete debe ser >= último reportado (${latest.percentComplete.toString()})`,
        );
      }

      const progress = await tx.activityProgress.create({
        data: {
          activityId,
          percentComplete: new Prisma.Decimal(dto.percentComplete),
          quantityCompleted:
            dto.quantityCompleted !== undefined ? new Prisma.Decimal(dto.quantityCompleted) : null,
          reportedBy: user.id,
          notes: dto.notes,
        },
      });

      const updates: Prisma.ActivityUpdateInput = {
        ...(dto.quantityCompleted !== undefined && {
          actualQuantity: new Prisma.Decimal(dto.quantityCompleted),
        }),
      };

      if (dto.percentComplete >= 100) {
        updates.status = ActivityStatus.TERMINADA;
        updates.actualEnd = new Date();
      } else if (activity.status === ActivityStatus.PENDIENTE) {
        updates.status = ActivityStatus.EN_CURSO;
        updates.actualStart = activity.actualStart ?? new Date();
      }

      if (Object.keys(updates).length > 0) {
        await tx.activity.update({ where: { id: activityId }, data: updates });
      }

      return progress;
    });
  }

  async summary(projectId: string): Promise<ProjectProgressSummary> {
    await this.projects.assertExists(projectId);

    const activities = await this.prisma.activity.findMany({
      where: { projectId },
      include: {
        progresses: {
          orderBy: { reportDate: 'desc' },
          take: 1,
        },
      },
    });

    if (activities.length === 0) {
      return { projectId, weightedPercent: 0, byStage: [], activities: [] };
    }

    const withPct = activities.map((a) => ({
      id: a.id,
      name: a.name,
      stage: a.stage,
      weight: Number(a.weight),
      status: a.status,
      percentComplete:
        a.status === ActivityStatus.TERMINADA
          ? 100
          : a.progresses.length > 0
            ? Number(a.progresses[0].percentComplete)
            : 0,
    }));

    const weightedPercent = this.weighted(withPct);

    const stages: ActivityStage[] = ['BRUTA', 'FINA'];
    const byStage = stages.map((s) => {
      const inStage = withPct.filter((w) => w.stage === s);
      return {
        stage: s,
        weightedPercent: this.weighted(inStage),
        activities: inStage.length,
      };
    });

    return { projectId, weightedPercent, byStage, activities: withPct };
  }

  private weighted(items: Array<{ weight: number; percentComplete: number }>): number {
    if (items.length === 0) return 0;
    const totalWeight = items.reduce((acc, i) => acc + i.weight, 0);
    if (totalWeight === 0) return 0;
    const sum = items.reduce((acc, i) => acc + i.weight * i.percentComplete, 0);
    return Math.round((sum / totalWeight) * 100) / 100;
  }
}

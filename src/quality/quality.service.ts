import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  FindingSeverity,
  FindingStatus,
  Prisma,
  QualityFinding,
  QualityInspection,
  RoleCode,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { assertFindingTransition } from './finding-status.machine';

const VALID_INSPECTOR_ROLES: RoleCode[] = ['ENCARG_CALIDAD', 'INGENIERO', 'SUPERVISOR', 'ADMIN'];

export interface QualitySummary {
  projectId: string;
  inspections: number;
  findings: {
    total: number;
    bySeverity: Record<FindingSeverity, number>;
    byStatus: Record<FindingStatus, number>;
    openCritical: number;
    overdue: number;
  };
}

@Injectable()
export class QualityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async createInspection(projectId: string, dto: CreateInspectionDto): Promise<QualityInspection> {
    await this.projects.assertExists(projectId);
    await this.assertInspectorRole(dto.inspectorId);

    return this.prisma.qualityInspection.create({
      data: {
        projectId,
        inspectorId: dto.inspectorId,
        stage: dto.stage,
        scope: dto.scope,
      },
    });
  }

  async listInspections(projectId: string) {
    await this.projects.assertExists(projectId);
    return this.prisma.qualityInspection.findMany({
      where: { projectId },
      include: { findings: true },
      orderBy: { inspectionDate: 'desc' },
    });
  }

  async findInspection(id: string): Promise<QualityInspection> {
    const found = await this.prisma.qualityInspection.findUnique({
      where: { id },
      include: { findings: { orderBy: { severity: 'desc' } } },
    });
    if (!found) throw new NotFoundException(`Inspección no encontrada: ${id}`);
    return found;
  }

  async addFinding(inspectionId: string, dto: CreateFindingDto): Promise<QualityFinding> {
    await this.findInspection(inspectionId);
    return this.prisma.qualityFinding.create({
      data: {
        inspectionId,
        severity: dto.severity,
        description: dto.description,
        correctiveAction: dto.correctiveAction,
        targetDate: dto.targetDate,
      },
    });
  }

  async updateFinding(
    inspectionId: string,
    findingId: string,
    dto: UpdateFindingDto,
  ): Promise<QualityFinding> {
    const f = await this.prisma.qualityFinding.findFirst({
      where: { id: findingId, inspectionId },
    });
    if (!f) throw new NotFoundException(`Finding no encontrado: ${findingId}`);

    if (dto.status && dto.status !== f.status) {
      assertFindingTransition(f.status, dto.status);
    }

    const closing = dto.status === FindingStatus.RESUELTA || dto.status === FindingStatus.RECHAZADA;
    const data: Prisma.QualityFindingUpdateInput = {
      ...(dto.correctiveAction !== undefined && { correctiveAction: dto.correctiveAction }),
      ...(dto.targetDate !== undefined && { targetDate: dto.targetDate }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(closing && !f.closedDate && { closedDate: new Date() }),
    };

    return this.prisma.qualityFinding.update({ where: { id: findingId }, data });
  }

  async summary(projectId: string): Promise<QualitySummary> {
    await this.projects.assertExists(projectId);

    const [inspections, findings] = await Promise.all([
      this.prisma.qualityInspection.count({ where: { projectId } }),
      this.prisma.qualityFinding.findMany({
        where: { inspection: { projectId } },
      }),
    ]);

    const bySeverity: Record<FindingSeverity, number> = { LEVE: 0, MEDIA: 0, GRAVE: 0, CRITICA: 0 };
    const byStatus: Record<FindingStatus, number> = {
      ABIERTA: 0,
      EN_CORRECCION: 0,
      RESUELTA: 0,
      RECHAZADA: 0,
    };
    let openCritical = 0;
    let overdue = 0;
    const now = Date.now();

    for (const f of findings) {
      bySeverity[f.severity]++;
      byStatus[f.status]++;
      if (
        (f.status === FindingStatus.ABIERTA || f.status === FindingStatus.EN_CORRECCION) &&
        f.severity === FindingSeverity.CRITICA
      ) {
        openCritical++;
      }
      if (
        f.targetDate &&
        f.targetDate.getTime() < now &&
        (f.status === FindingStatus.ABIERTA || f.status === FindingStatus.EN_CORRECCION)
      ) {
        overdue++;
      }
    }

    return {
      projectId,
      inspections,
      findings: {
        total: findings.length,
        bySeverity,
        byStatus,
        openCritical,
        overdue,
      },
    };
  }

  private async assertInspectorRole(userId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
      include: { roleAssignments: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException(`User no encontrado: ${userId}`);
    const codes = user.roleAssignments.map((a) => a.role.code);
    const ok = codes.some((c) => VALID_INSPECTOR_ROLES.includes(c));
    if (!ok) {
      throw new BadRequestException(
        `Inspector requiere uno de: ${VALID_INSPECTOR_ROLES.join(', ')}. Tiene: ${codes.join(', ') || '(ninguno)'}`,
      );
    }
  }
}

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ContractStatus,
  Prisma,
  Project,
  ProjectKind,
  ProjectStage,
  ProjectStatus,
  PropertyStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertPropertyTransition } from '../properties/property-status.machine';
import { CreateConstructionMasterDto } from './dto/create-construction-master.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects.query';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  assertProjectStageTransition,
  assertProjectStatusTransition,
} from './project-status.machine';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromContract(dto: CreateProjectDto): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({
        where: { id: dto.contractId, deletedAt: null },
      });
      if (!contract) throw new NotFoundException(`Contrato no encontrado: ${dto.contractId}`);
      if (contract.status !== ContractStatus.FIRMADO) {
        throw new BadRequestException(
          `Solo se inicia proyecto sobre contrato FIRMADO. Estado: ${contract.status}`,
        );
      }

      const existing = await tx.project.findFirst({
        where: { OR: [{ contractId: dto.contractId }, { propertyId: contract.propertyId }] },
      });
      if (existing) {
        throw new ConflictException(`Ya existe proyecto para este contrato/propiedad: ${existing.id}`);
      }

      const codeDup = await tx.project.findUnique({ where: { code: dto.code } });
      if (codeDup) throw new ConflictException(`Código de proyecto ya en uso: ${dto.code}`);

      await this.assertUserHasRole(tx, dto.projectManagerId, 'ENCARG_PROYECTO');
      if (dto.qualityManagerId) await this.assertUserHasRole(tx, dto.qualityManagerId, 'ENCARG_CALIDAD');
      if (dto.budgetManagerId) await this.assertUserHasRole(tx, dto.budgetManagerId, 'ENCARG_PRESUPUESTO');

      const property = await tx.property.findUniqueOrThrow({ where: { id: contract.propertyId } });
      assertPropertyTransition(property.status, PropertyStatus.EN_CONSTRUCCION);
      await tx.property.update({
        where: { id: property.id },
        data: { status: PropertyStatus.EN_CONSTRUCCION },
      });

      return tx.project.create({
        data: {
          code: dto.code,
          kind: 'UNIT_SALE',
          propertyId: contract.propertyId,
          contractId: contract.id,
          startDate: dto.startDate,
          projectManagerId: dto.projectManagerId,
          qualityManagerId: dto.qualityManagerId,
          budgetManagerId: dto.budgetManagerId,
        },
      });
    });
  }

  async createConstructionMaster(developmentId: string, dto: CreateConstructionMasterDto): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      const dev = await tx.development.findFirst({
        where: { id: developmentId, deletedAt: null },
        include: {
          acquisitionContracts: true,
          permits: true,
          projects: { where: { kind: 'CONSTRUCTION_MASTER', deletedAt: null } },
        },
      });
      if (!dev) throw new NotFoundException(`Desarrollo no encontrado: ${developmentId}`);

      if (dev.projects.length > 0) {
        throw new ConflictException(
          `Desarrollo ya tiene proyecto de construcción: ${dev.projects[0].id}`,
        );
      }

      const hasSignedAcquisition = dev.acquisitionContracts.some((a) => a.status === 'FIRMADO');
      if (!hasSignedAcquisition) {
        throw new BadRequestException(
          'Requiere al menos una adquisición de terreno FIRMADA antes de iniciar construcción',
        );
      }

      const hasApprovedMunicipal = dev.permits.some(
        (p) => p.status === 'APROBADO' && p.type === 'MUNICIPAL',
      );
      if (!hasApprovedMunicipal) {
        throw new BadRequestException(
          'Requiere permiso MUNICIPAL APROBADO antes de iniciar construcción',
        );
      }

      if (dev.status !== 'PERMISOS' && dev.status !== 'EN_CONSTRUCCION') {
        throw new BadRequestException(
          `Desarrollo en estado ${dev.status}. Avanzá a PERMISOS antes de crear proyecto de construcción.`,
        );
      }

      const codeDup = await tx.project.findUnique({ where: { code: dto.code } });
      if (codeDup) throw new ConflictException(`Código de proyecto ya en uso: ${dto.code}`);

      await this.assertUserHasRole(tx, dto.projectManagerId, 'ENCARG_PROYECTO');
      if (dto.qualityManagerId) await this.assertUserHasRole(tx, dto.qualityManagerId, 'ENCARG_CALIDAD');
      if (dto.budgetManagerId) await this.assertUserHasRole(tx, dto.budgetManagerId, 'ENCARG_PRESUPUESTO');

      const created = await tx.project.create({
        data: {
          code: dto.code,
          kind: 'CONSTRUCTION_MASTER',
          developmentId: dev.id,
          propertyId: null,
          contractId: null,
          startDate: dto.startDate,
          status: 'EN_EJECUCION',
          projectManagerId: dto.projectManagerId,
          qualityManagerId: dto.qualityManagerId,
          budgetManagerId: dto.budgetManagerId,
        },
      });

      if (dev.status !== 'EN_CONSTRUCCION') {
        await tx.development.update({
          where: { id: dev.id },
          data: { status: 'EN_CONSTRUCCION' },
        });
      }

      return created;
    });
  }

  async finalizeConstructionMaster(projectId: string): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      const p = await tx.project.findFirst({
        where: { id: projectId, deletedAt: null },
        include: { development: true },
      });
      if (!p) throw new NotFoundException(`Proyecto no encontrado: ${projectId}`);
      if (p.kind !== 'CONSTRUCTION_MASTER') {
        throw new BadRequestException('Solo proyectos CONSTRUCTION_MASTER usan este endpoint');
      }
      if (p.status === 'FINALIZADO') {
        throw new BadRequestException('Proyecto ya finalizado');
      }

      const updated = await tx.project.update({
        where: { id: projectId },
        data: {
          status: 'FINALIZADO',
          currentStage: 'ENTREGA',
          endDate: p.endDate ?? new Date(),
        },
      });

      if (p.development && p.development.status === 'EN_CONSTRUCCION') {
        await tx.development.update({
          where: { id: p.development.id },
          data: { status: 'COMERCIALIZACION' },
        });
      }

      return updated;
    });
  }

  async list(q: ListProjectsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...(q.status && { status: q.status }),
      ...(q.currentStage && { currentStage: q.currentStage }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: { property: true, contract: true, development: true },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Project> {
    const found = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        property: true,
        contract: true,
        development: true,
        activities: { orderBy: { plannedStart: 'asc' } },
        preliminaries: true,
      },
    });
    if (!found) throw new NotFoundException(`Proyecto no encontrado: ${id}`);
    return found;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.project.findFirst({ where: { id, deletedAt: null } });
      if (!current) throw new NotFoundException(`Proyecto no encontrado: ${id}`);

      if (dto.status && dto.status !== current.status) {
        assertProjectStatusTransition(current.status, dto.status);
      }
      if (dto.currentStage && dto.currentStage !== current.currentStage) {
        assertProjectStageTransition(current.currentStage, dto.currentStage);
      }
      if (dto.qualityManagerId) await this.assertUserHasRole(tx, dto.qualityManagerId, 'ENCARG_CALIDAD');
      if (dto.budgetManagerId) await this.assertUserHasRole(tx, dto.budgetManagerId, 'ENCARG_PRESUPUESTO');

      const updated = await tx.project.update({
        where: { id },
        data: {
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.currentStage !== undefined && { currentStage: dto.currentStage }),
          ...(dto.endDate !== undefined && { endDate: dto.endDate }),
          ...(dto.qualityManagerId !== undefined && { qualityManagerId: dto.qualityManagerId }),
          ...(dto.budgetManagerId !== undefined && { budgetManagerId: dto.budgetManagerId }),
        },
      });

      if (dto.status === ProjectStatus.FINALIZADO && current.status !== ProjectStatus.FINALIZADO) {
        await tx.project.update({
          where: { id },
          data: { endDate: updated.endDate ?? new Date(), currentStage: ProjectStage.ENTREGA },
        });
      }

      return updated;
    });
  }

  async assertExists(id: string): Promise<void> {
    const found = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!found) throw new NotFoundException(`Proyecto no encontrado: ${id}`);
  }

  private async assertUserHasRole(
    tx: Prisma.TransactionClient,
    userId: string,
    roleCode: string,
  ): Promise<void> {
    const user = await tx.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
      include: { roleAssignments: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException(`Usuario no encontrado: ${userId}`);
    const has = user.roleAssignments.some((a) => a.role.code === roleCode);
    if (!has) {
      throw new BadRequestException(`Usuario ${userId} no tiene rol ${roleCode}`);
    }
  }
}

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BlueprintInstallation,
  BlueprintModel,
  BlueprintVersion,
  Prisma,
  RoleCode,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlueprintModelDto } from './dto/create-blueprint-model.dto';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

@Injectable()
export class BlueprintsService {
  constructor(private readonly prisma: PrismaService) {}

  createModel(dto: CreateBlueprintModelDto): Promise<BlueprintModel> {
    return this.prisma.blueprintModel.create({ data: dto });
  }

  async listModels(): Promise<BlueprintModel[]> {
    return this.prisma.blueprintModel.findMany({
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findModel(id: string): Promise<BlueprintModel> {
    const found = await this.prisma.blueprintModel.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: 'desc' }, include: { installations: true } },
      },
    });
    if (!found) throw new NotFoundException(`BlueprintModel no encontrado: ${id}`);
    return found;
  }

  async createVersion(modelId: string, dto: CreateVersionDto): Promise<BlueprintVersion> {
    return this.prisma.$transaction(async (tx) => {
      const model = await tx.blueprintModel.findUnique({ where: { id: modelId } });
      if (!model) throw new NotFoundException(`BlueprintModel no encontrado: ${modelId}`);

      await this.assertUserHasRole(tx, dto.arquitectId, 'ARQUITECTO');
      await this.assertUserHasRole(tx, dto.engineerId, 'INGENIERO');

      const latest = await tx.blueprintVersion.findFirst({
        where: { modelId },
        orderBy: { versionNumber: 'desc' },
      });
      const versionNumber = (latest?.versionNumber ?? 0) + 1;

      if (latest) {
        await tx.blueprintVersion.update({
          where: { id: latest.id },
          data: { isCurrent: false },
        });
      }

      return tx.blueprintVersion.create({
        data: {
          modelId,
          versionNumber,
          arquitectId: dto.arquitectId,
          engineerId: dto.engineerId,
          architecturalDesign: dto.architecturalDesign as Prisma.InputJsonValue,
          structuralCalcs: dto.structuralCalcs as Prisma.InputJsonValue,
          estimatedBudget:
            dto.estimatedBudget !== undefined ? new Prisma.Decimal(dto.estimatedBudget) : null,
          isCurrent: true,
        },
      });
    });
  }

  async updateVersion(versionId: string, dto: UpdateVersionDto): Promise<BlueprintVersion> {
    return this.prisma.$transaction(async (tx) => {
      const v = await tx.blueprintVersion.findUnique({ where: { id: versionId } });
      if (!v) throw new NotFoundException(`BlueprintVersion no encontrada: ${versionId}`);

      if (v.optimisticVersion !== dto.expectedOptimisticVersion) {
        throw new ConflictException(
          `Versión obsoleta. Actual: ${v.optimisticVersion}, enviada: ${dto.expectedOptimisticVersion}`,
        );
      }

      return tx.blueprintVersion.update({
        where: { id: versionId },
        data: {
          ...(dto.architecturalDesign !== undefined && {
            architecturalDesign: dto.architecturalDesign as Prisma.InputJsonValue,
          }),
          ...(dto.structuralCalcs !== undefined && {
            structuralCalcs: dto.structuralCalcs as Prisma.InputJsonValue,
          }),
          ...(dto.estimatedBudget !== undefined && {
            estimatedBudget: new Prisma.Decimal(dto.estimatedBudget),
          }),
          optimisticVersion: v.optimisticVersion + 1,
        },
      });
    });
  }

  async setCurrent(modelId: string, versionId: string): Promise<BlueprintVersion> {
    return this.prisma.$transaction(async (tx) => {
      const v = await tx.blueprintVersion.findFirst({ where: { id: versionId, modelId } });
      if (!v) throw new NotFoundException('Versión no pertenece al modelo');
      await tx.blueprintVersion.updateMany({
        where: { modelId },
        data: { isCurrent: false },
      });
      return tx.blueprintVersion.update({
        where: { id: versionId },
        data: { isCurrent: true },
      });
    });
  }

  async addInstallation(versionId: string, dto: CreateInstallationDto): Promise<BlueprintInstallation> {
    const v = await this.prisma.blueprintVersion.findUnique({ where: { id: versionId } });
    if (!v) throw new NotFoundException(`Versión no encontrada: ${versionId}`);
    return this.prisma.blueprintInstallation.create({
      data: {
        versionId,
        type: dto.type,
        spec: dto.spec as Prisma.InputJsonValue,
      },
    });
  }

  private async assertUserHasRole(
    tx: Prisma.TransactionClient,
    userId: string,
    roleCode: RoleCode,
  ): Promise<void> {
    const user = await tx.user.findFirst({
      where: { id: userId, deletedAt: null, isActive: true },
      include: { roleAssignments: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException(`User no encontrado: ${userId}`);
    const has = user.roleAssignments.some((a) => a.role.code === roleCode);
    if (!has) throw new BadRequestException(`User ${userId} no tiene rol ${roleCode}`);
  }
}

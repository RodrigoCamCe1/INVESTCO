import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Property, PropertyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { DividePropertyDto } from './dto/divide-property.dto';
import { ListPropertiesQueryDto } from './dto/list-properties.query';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { assertPropertyTransition } from './property-status.machine';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto): Promise<Property> {
    await this.assertCodeFree(dto.code);
    if (dto.modelBlueprintId) await this.assertBlueprintExists(dto.modelBlueprintId);

    try {
      return await this.prisma.property.create({
        data: {
          code: dto.code,
          type: dto.type,
          address: dto.address,
          zone: dto.zone,
          m2: new Prisma.Decimal(dto.m2),
          modelBlueprintId: dto.modelBlueprintId,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Código duplicado: ${dto.code}`);
      }
      throw e;
    }
  }

  async list(q: ListPropertiesQueryDto): Promise<{ items: Property[]; total: number; page: number; limit: number }> {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      ...(q.status && { status: q.status }),
      ...(q.type && { type: q.type }),
      ...(q.zone && { zone: { contains: q.zone, mode: 'insensitive' } }),
      ...(q.parentPropertyId !== undefined && { parentPropertyId: q.parentPropertyId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Property> {
    const found = await this.prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: { childProperties: true, modelBlueprint: true },
    });
    if (!found) throw new NotFoundException(`Inmueble no encontrado: ${id}`);
    return found;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const current = await this.findById(id);

    if (dto.status && dto.status !== current.status) {
      assertPropertyTransition(current.status, dto.status);
    }
    if (dto.modelBlueprintId) await this.assertBlueprintExists(dto.modelBlueprintId);

    return this.prisma.property.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.zone !== undefined && { zone: dto.zone }),
        ...(dto.m2 !== undefined && { m2: new Prisma.Decimal(dto.m2) }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.modelBlueprintId !== undefined && { modelBlueprintId: dto.modelBlueprintId }),
      },
    });
  }

  async softDelete(id: string): Promise<{ id: string; deletedAt: Date }> {
    const current = await this.findById(id);
    if (current.status !== PropertyStatus.DISPONIBLE) {
      throw new BadRequestException(
        `Solo se puede eliminar inmuebles DISPONIBLE. Estado actual: ${current.status}`,
      );
    }
    const updated = await this.prisma.property.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id: updated.id, deletedAt: updated.deletedAt! };
  }

  async divide(parentId: string, dto: DividePropertyDto): Promise<{ parent: Property; children: Property[] }> {
    const parent = await this.findById(parentId);
    if (parent.status !== PropertyStatus.DISPONIBLE) {
      throw new BadRequestException(`Solo se puede dividir inmuebles DISPONIBLE. Estado: ${parent.status}`);
    }
    if (parent.parentPropertyId) {
      throw new BadRequestException('No se puede dividir un inmueble que ya es subdivisión');
    }

    const sumM2 = dto.children.reduce((acc, c) => acc + Number(c.m2), 0);
    if (sumM2 > Number(parent.m2) + 1e-6) {
      throw new BadRequestException(
        `Suma m² de hijos (${sumM2}) excede m² padre (${parent.m2.toString()})`,
      );
    }

    const codes = dto.children.map((c) => c.code);
    if (new Set(codes).size !== codes.length) {
      throw new BadRequestException('Códigos de hijos duplicados en el request');
    }
    const existing = await this.prisma.property.findMany({
      where: { code: { in: codes } },
      select: { code: true },
    });
    if (existing.length > 0) {
      throw new ConflictException(`Códigos ya en uso: ${existing.map((e) => e.code).join(', ')}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const children: Property[] = [];
      for (const c of dto.children) {
        const child = await tx.property.create({
          data: {
            code: c.code,
            type: c.type,
            address: c.address,
            zone: c.zone,
            m2: new Prisma.Decimal(c.m2),
            parentPropertyId: parent.id,
          },
        });
        children.push(child);
      }
      const reloadedParent = await tx.property.findUniqueOrThrow({ where: { id: parent.id } });
      return { parent: reloadedParent, children };
    });
  }

  private async assertCodeFree(code: string): Promise<void> {
    const dup = await this.prisma.property.findUnique({ where: { code } });
    if (dup) throw new ConflictException(`Código ya en uso: ${code}`);
  }

  private async assertBlueprintExists(id: string): Promise<void> {
    const bp = await this.prisma.blueprintModel.findUnique({ where: { id } });
    if (!bp) throw new NotFoundException(`BlueprintModel no encontrado: ${id}`);
  }
}

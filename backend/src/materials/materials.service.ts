import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Material, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { ListMaterialsQueryDto } from './dto/list-materials.query';
import { UpdateMaterialDto } from './dto/update-material.dto';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto): Promise<Material> {
    try {
      return await this.prisma.material.create({
        data: {
          code: dto.code,
          name: dto.name,
          unit: dto.unit,
          referencePrice: new Prisma.Decimal(dto.referencePrice),
          category: dto.category,
          description: dto.description,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Código de material duplicado: ${dto.code}`);
      }
      throw e;
    }
  }

  async list(q: ListMaterialsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.MaterialWhereInput = {
      ...(q.category && { category: { equals: q.category, mode: 'insensitive' } }),
      ...(q.q && {
        OR: [
          { code: { contains: q.q, mode: 'insensitive' } },
          { name: { contains: q.q, mode: 'insensitive' } },
        ],
      }),
      ...(q.isActive !== undefined && { isActive: q.isActive === 'true' }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.material.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      this.prisma.material.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Material> {
    const found = await this.prisma.material.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Material no encontrado: ${id}`);
    return found;
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    await this.findById(id);
    return this.prisma.material.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.referencePrice !== undefined && { referencePrice: new Prisma.Decimal(dto.referencePrice) }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findById(id);
    const inUse = await this.prisma.purchaseOrderLine.findFirst({ where: { materialId: id } });
    if (inUse) {
      await this.prisma.material.update({ where: { id }, data: { isActive: false } });
      return { id };
    }
    await this.prisma.material.delete({ where: { id } });
    return { id };
  }
}

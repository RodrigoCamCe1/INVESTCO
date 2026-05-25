import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Development, DevelopmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDevelopmentDto } from './dto/create-development.dto';
import { UpdateDevelopmentDto } from './dto/update-development.dto';

const STATUS_ORDER: DevelopmentStatus[] = [
  'PLANIFICACION',
  'ADQUISICION',
  'PERMISOS',
  'EN_CONSTRUCCION',
  'COMERCIALIZACION',
  'COMPLETADO',
];

function isValidTransition(from: DevelopmentStatus, to: DevelopmentStatus): boolean {
  if (from === to) return true;
  if (to === 'CANCELADO') return from !== 'COMPLETADO';
  const fromIdx = STATUS_ORDER.indexOf(from);
  const toIdx = STATUS_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return toIdx === fromIdx + 1 || toIdx === fromIdx;
}

@Injectable()
export class DevelopmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDevelopmentDto): Promise<Development> {
    try {
      return await this.prisma.development.create({
        data: {
          code: dto.code,
          name: dto.name,
          zone: dto.zone,
          address: dto.address,
          description: dto.description,
          acquisitionBudget: new Prisma.Decimal(dto.acquisitionBudget),
          constructionBudget: new Prisma.Decimal(dto.constructionBudget),
          currency: dto.currency ?? 'BOB',
          estimatedUnits: dto.estimatedUnits,
          startDate: dto.startDate,
          estimatedCompletion: dto.estimatedCompletion,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`Código duplicado: ${dto.code}`);
      }
      throw e;
    }
  }

  async list(filter?: { status?: DevelopmentStatus }): Promise<Development[]> {
    return this.prisma.development.findMany({
      where: {
        deletedAt: null,
        ...(filter?.status ? { status: filter.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { units: true, permits: true, projects: true, acquisitionContracts: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const dev = await this.prisma.development.findFirst({
      where: { id, deletedAt: null },
      include: {
        acquisitionContracts: { orderBy: { createdAt: 'desc' } },
        permits: { orderBy: { createdAt: 'desc' } },
        projects: { include: { property: true } },
        units: { where: { deletedAt: null } },
      },
    });
    if (!dev) throw new NotFoundException(`Desarrollo no encontrado: ${id}`);
    return dev;
  }

  async update(id: string, dto: UpdateDevelopmentDto): Promise<Development> {
    const dev = await this.prisma.development.findFirst({ where: { id, deletedAt: null } });
    if (!dev) throw new NotFoundException(`Desarrollo no encontrado: ${id}`);

    if (dto.status && dto.status !== dev.status && !isValidTransition(dev.status, dto.status)) {
      throw new BadRequestException(
        `Transición inválida: ${dev.status} → ${dto.status}. Avanzá una etapa a la vez (o CANCELADO).`,
      );
    }

    return this.prisma.development.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.zone !== undefined && { zone: dto.zone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.acquisitionBudget !== undefined && { acquisitionBudget: new Prisma.Decimal(dto.acquisitionBudget) }),
        ...(dto.constructionBudget !== undefined && { constructionBudget: new Prisma.Decimal(dto.constructionBudget) }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.estimatedUnits !== undefined && { estimatedUnits: dto.estimatedUnits }),
        ...(dto.estimatedCompletion !== undefined && { estimatedCompletion: dto.estimatedCompletion }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: string): Promise<{ ok: true }> {
    const dev = await this.prisma.development.findFirst({ where: { id, deletedAt: null } });
    if (!dev) throw new NotFoundException(`Desarrollo no encontrado: ${id}`);
    if (dev.status === 'EN_CONSTRUCCION' || dev.status === 'COMERCIALIZACION') {
      throw new BadRequestException(
        `No se puede eliminar un desarrollo ${dev.status}. Cancelarlo primero.`,
      );
    }
    await this.prisma.development.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }
}

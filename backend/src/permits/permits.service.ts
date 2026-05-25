import { Injectable, NotFoundException } from '@nestjs/common';
import { Permit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermitDto } from './dto/create-permit.dto';
import { UpdatePermitDto } from './dto/update-permit.dto';

@Injectable()
export class PermitsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(developmentId: string): Promise<Permit[]> {
    await this.assertDevExists(developmentId);
    return this.prisma.permit.findMany({
      where: { developmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(developmentId: string, dto: CreatePermitDto): Promise<Permit> {
    await this.assertDevExists(developmentId);
    return this.prisma.permit.create({
      data: {
        developmentId,
        type: dto.type,
        permitNumber: dto.permitNumber,
        issuedDate: dto.issuedDate,
        validUntil: dto.validUntil,
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdatePermitDto): Promise<Permit> {
    const p = await this.prisma.permit.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Permiso no encontrado: ${id}`);
    return this.prisma.permit.update({
      where: { id },
      data: {
        ...(dto.permitNumber !== undefined && { permitNumber: dto.permitNumber }),
        ...(dto.issuedDate !== undefined && { issuedDate: dto.issuedDate }),
        ...(dto.validUntil !== undefined && { validUntil: dto.validUntil }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: string): Promise<{ ok: true }> {
    const p = await this.prisma.permit.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Permiso no encontrado: ${id}`);
    await this.prisma.permit.delete({ where: { id } });
    return { ok: true };
  }

  private async assertDevExists(developmentId: string): Promise<void> {
    const dev = await this.prisma.development.findFirst({
      where: { id: developmentId, deletedAt: null },
    });
    if (!dev) throw new NotFoundException(`Desarrollo no encontrado: ${developmentId}`);
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AcquisitionContract, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcquisitionDto } from './dto/create-acquisition.dto';

@Injectable()
export class AcquisitionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(developmentId: string): Promise<AcquisitionContract[]> {
    await this.assertDevExists(developmentId);
    return this.prisma.acquisitionContract.findMany({
      where: { developmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(developmentId: string, dto: CreateAcquisitionDto): Promise<AcquisitionContract> {
    await this.assertDevExists(developmentId);
    return this.prisma.acquisitionContract.create({
      data: {
        developmentId,
        sellerName: dto.sellerName,
        sellerCi: dto.sellerCi,
        sellerPhone: dto.sellerPhone,
        totalAmount: new Prisma.Decimal(dto.totalAmount),
        currency: dto.currency ?? 'BOB',
        notes: dto.notes,
      },
    });
  }

  async sign(id: string): Promise<AcquisitionContract> {
    const ac = await this.prisma.acquisitionContract.findUnique({ where: { id } });
    if (!ac) throw new NotFoundException(`Adquisición no encontrada: ${id}`);
    if (ac.status === 'FIRMADO') throw new BadRequestException('Ya firmado');
    if (ac.status === 'CANCELADO') throw new BadRequestException('Adquisición cancelada');

    return this.prisma.$transaction(async (tx) => {
      const signed = await tx.acquisitionContract.update({
        where: { id },
        data: { status: 'FIRMADO', signedDate: new Date() },
      });
      // Avance automático: si dev en PLANIFICACION o ADQUISICION → mover a PERMISOS
      const dev = await tx.development.findUnique({ where: { id: signed.developmentId } });
      if (dev && (dev.status === 'PLANIFICACION' || dev.status === 'ADQUISICION')) {
        await tx.development.update({
          where: { id: dev.id },
          data: { status: 'PERMISOS' },
        });
      }
      return signed;
    });
  }

  async cancel(id: string): Promise<AcquisitionContract> {
    const ac = await this.prisma.acquisitionContract.findUnique({ where: { id } });
    if (!ac) throw new NotFoundException(`Adquisición no encontrada: ${id}`);
    if (ac.status === 'FIRMADO') {
      throw new BadRequestException('No se puede cancelar una adquisición firmada');
    }
    return this.prisma.acquisitionContract.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });
  }

  private async assertDevExists(developmentId: string): Promise<void> {
    const dev = await this.prisma.development.findFirst({
      where: { id: developmentId, deletedAt: null },
    });
    if (!dev) throw new NotFoundException(`Desarrollo no encontrado: ${developmentId}`);
  }
}

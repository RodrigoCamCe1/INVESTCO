import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Worker, WorkerType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { ListWorkersQueryDto } from './dto/list-workers.query';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkerDto): Promise<Worker> {
    if (dto.type === WorkerType.EXTERNO && !dto.userId && !dto.contractorCompany) {
      throw new BadRequestException('Worker EXTERNO sin userId requiere contractorCompany');
    }
    if (dto.userId) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.userId, deletedAt: null },
      });
      if (!user) throw new NotFoundException(`User no encontrado: ${dto.userId}`);
      const dup = await this.prisma.worker.findUnique({ where: { userId: dto.userId } });
      if (dup) throw new ConflictException(`Ya existe worker para ese User: ${dup.id}`);
    }

    return this.prisma.worker.create({
      data: {
        type: dto.type,
        speciality: dto.speciality,
        userId: dto.userId,
        contractorCompany: dto.contractorCompany,
        dailyRate: dto.dailyRate !== undefined ? new Prisma.Decimal(dto.dailyRate) : null,
        hourlyRate: dto.hourlyRate !== undefined ? new Prisma.Decimal(dto.hourlyRate) : null,
      },
    });
  }

  async list(q: ListWorkersQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.WorkerWhereInput = {
      ...(q.type && { type: q.type }),
      ...(q.speciality && { speciality: { contains: q.speciality, mode: 'insensitive' } }),
      ...(q.isActive !== undefined && { isActive: q.isActive === 'true' }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.worker.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, email: true, fullName: true } } },
        orderBy: { speciality: 'asc' },
      }),
      this.prisma.worker.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Worker> {
    const found = await this.prisma.worker.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
    if (!found) throw new NotFoundException(`Worker no encontrado: ${id}`);
    return found;
  }

  async update(id: string, dto: UpdateWorkerDto): Promise<Worker> {
    await this.findById(id);
    return this.prisma.worker.update({
      where: { id },
      data: {
        ...(dto.speciality !== undefined && { speciality: dto.speciality }),
        ...(dto.contractorCompany !== undefined && { contractorCompany: dto.contractorCompany }),
        ...(dto.dailyRate !== undefined && { dailyRate: new Prisma.Decimal(dto.dailyRate) }),
        ...(dto.hourlyRate !== undefined && { hourlyRate: new Prisma.Decimal(dto.hourlyRate) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deactivate(id: string): Promise<Worker> {
    await this.findById(id);
    return this.prisma.worker.update({ where: { id }, data: { isActive: false } });
  }

  async assertActive(id: string): Promise<Worker> {
    const found = await this.findById(id);
    if (!found.isActive) throw new BadRequestException('Worker inactivo');
    return found;
  }
}

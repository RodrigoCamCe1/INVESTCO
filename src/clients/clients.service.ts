import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertClientTransition } from './client-status.machine';
import { CreateClientDto } from './dto/create-client.dto';
import { ListClientsQueryDto } from './dto/list-clients.query';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto): Promise<Client> {
    try {
      return await this.prisma.client.create({ data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`CI ya registrado: ${dto.ci}`);
      }
      throw e;
    }
  }

  async list(q: ListClientsQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.ClientWhereInput = {
      deletedAt: null,
      ...(q.status && { status: q.status }),
      ...(q.q && {
        OR: [
          { firstName: { contains: q.q, mode: 'insensitive' } },
          { lastName: { contains: q.q, mode: 'insensitive' } },
          { ci: { contains: q.q, mode: 'insensitive' } },
          { email: { contains: q.q, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string): Promise<Client> {
    const found = await this.prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        meetings: { orderBy: { scheduledAt: 'desc' } },
        creditChecks: { orderBy: { checkDate: 'desc' } },
      },
    });
    if (!found) throw new NotFoundException(`Cliente no encontrado: ${id}`);
    return found;
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const current = await this.findById(id);
    if (dto.status && dto.status !== current.status) {
      assertClientTransition(current.status, dto.status);
    }
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async softDelete(id: string): Promise<{ id: string; deletedAt: Date }> {
    await this.findById(id);
    const updated = await this.prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id: updated.id, deletedAt: updated.deletedAt! };
  }

  async assertExists(id: string): Promise<void> {
    const found = await this.prisma.client.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!found) throw new NotFoundException(`Cliente no encontrado: ${id}`);
  }
}

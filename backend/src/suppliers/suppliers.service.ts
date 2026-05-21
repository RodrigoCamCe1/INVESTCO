import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Supplier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSupplierDto): Promise<Supplier> {
    return this.prisma.supplier.create({ data: dto });
  }

  async list(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Supplier> {
    const found = await this.prisma.supplier.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Proveedor no encontrado: ${id}`);
    return found;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.findById(id);
    return this.prisma.supplier.update({ where: { id }, data: dto as Prisma.SupplierUpdateInput });
  }

  async deactivate(id: string): Promise<Supplier> {
    await this.findById(id);
    return this.prisma.supplier.update({ where: { id }, data: { isActive: false } });
  }
}

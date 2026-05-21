import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RoleCode, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface UserWithRoles {
  user: User;
  roleCodes: RoleCode[];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { roleAssignments: { include: { role: true } } },
    });
    if (!user) return null;
    return {
      user,
      roleCodes: user.roleAssignments.map((a) => a.role.code),
    };
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { roleAssignments: { include: { role: true } } },
    });
    if (!user) return null;
    return {
      user,
      roleCodes: user.roleAssignments.map((a) => a.role.code),
    };
  }

  async create(input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    roles: RoleCode[];
  }): Promise<UserWithRoles> {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictException(`Email ya registrado: ${input.email}`);

    if (input.roles.length === 0) {
      throw new ConflictException('Debe asignar al menos un rol');
    }

    const roles = await this.prisma.role.findMany({ where: { code: { in: input.roles } } });
    if (roles.length !== input.roles.length) {
      const found = new Set(roles.map((r) => r.code));
      const missing = input.roles.filter((c) => !found.has(c));
      throw new NotFoundException(`Roles no encontrados: ${missing.join(', ')}`);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        phone: input.phone,
        roleAssignments: {
          create: roles.map((r) => ({ roleId: r.id })),
        },
      },
      include: { roleAssignments: { include: { role: true } } },
    });

    return {
      user,
      roleCodes: user.roleAssignments.map((a) => a.role.code),
    };
  }
}

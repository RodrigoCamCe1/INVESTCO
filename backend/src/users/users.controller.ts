import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleCode } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'ENCARG_CALIDAD', 'ENCARG_PRESUPUESTO')
  @ApiQuery({ name: 'role', enum: RoleCode, required: false })
  async list(@Query('role') role?: RoleCode) {
    const result = await this.users.list({ role });
    return result.map((r) => ({
      id: r.user.id,
      email: r.user.email,
      fullName: r.user.fullName,
      phone: r.user.phone,
      isActive: r.user.isActive,
      roles: r.roleCodes,
    }));
  }
}

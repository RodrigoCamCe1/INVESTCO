import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Supplier } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly svc: SuppliersService) {}

  @Get()
  list(): Promise<Supplier[]> {
    return this.svc.list();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Supplier> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar proveedor' })
  create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSupplierDto): Promise<Supplier> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Desactivar proveedor (soft)' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<Supplier> {
    return this.svc.deactivate(id);
  }
}

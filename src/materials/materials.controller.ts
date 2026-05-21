import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Material } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMaterialDto } from './dto/create-material.dto';
import { ListMaterialsQueryDto } from './dto/list-materials.query';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialsService } from './materials.service';

@ApiTags('materials')
@ApiBearerAuth()
@Controller('materials')
export class MaterialsController {
  constructor(private readonly svc: MaterialsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar catálogo materiales' })
  list(@Query() q: ListMaterialsQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Material> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS', 'ENCARG_PRESUPUESTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear material' })
  create(@Body() dto: CreateMaterialDto): Promise<Material> {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS', 'ENCARG_PRESUPUESTO')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateMaterialDto): Promise<Material> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Borrar (o soft-deactivate si usado en alguna OC)' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(id);
  }
}

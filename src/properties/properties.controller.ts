import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Property } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePropertyDto } from './dto/create-property.dto';
import { DividePropertyDto } from './dto/divide-property.dto';
import { ListPropertiesQueryDto } from './dto/list-properties.query';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar inmuebles (paginado, filtrable)' })
  list(@Query() q: ListPropertiesQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener inmueble por id (incluye hijos y plano)' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Property> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear inmueble (ADMIN, GERENTE)' })
  create(@Body() dto: CreatePropertyDto): Promise<Property> {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Actualizar inmueble (valida state machine de status)' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft-delete (solo si DISPONIBLE)' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.softDelete(id);
  }

  @Post(':id/divide')
  @Roles('ADMIN', 'GERENTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Dividir inmueble en N subdivisiones' })
  divide(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: DividePropertyDto,
  ) {
    return this.svc.divide(id, dto);
  }
}

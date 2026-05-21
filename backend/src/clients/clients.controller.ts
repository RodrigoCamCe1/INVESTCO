import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Client } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { ListClientsQueryDto } from './dto/list-clients.query';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly svc: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  list(@Query() q: ListClientsQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente con meetings y credit-checks' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Client> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'SECRETARIA', 'VENDEDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear cliente' })
  create(@Body() dto: CreateClientDto): Promise<Client> {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'SECRETARIA', 'VENDEDOR')
  @ApiOperation({ summary: 'Actualizar cliente (valida state machine)' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<Client> {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Soft-delete cliente' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.softDelete(id);
  }
}

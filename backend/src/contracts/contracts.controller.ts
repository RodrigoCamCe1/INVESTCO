import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Contract } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ContractsService } from './contracts.service';
import { AmendContractDto } from './dto/amend-contract.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly svc: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  list(@Query() q: ListContractsQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener contrato (incluye property, client, previousContract)' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Contract> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear contrato BORRADOR a partir de reserva ACTIVA' })
  create(@Body() dto: CreateContractDto): Promise<Contract> {
    return this.svc.createFromReservation(dto);
  }

  @Patch(':id/submit-review')
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @ApiOperation({ summary: 'BORRADOR → REVISION' })
  submitReview(@Param('id', new ParseUUIDPipe()) id: string): Promise<Contract> {
    return this.svc.submitForReview(id);
  }

  @Patch(':id/sign')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Firmar contrato — REVISION→FIRMADO + Property→VENDIDO + Client→FIRMADO + Reserva→CONVERTIDA' })
  sign(@Param('id', new ParseUUIDPipe()) id: string): Promise<Contract> {
    return this.svc.sign(id);
  }

  @Patch(':id/rescind')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Rescindir contrato (libera Property)' })
  rescind(@Param('id', new ParseUUIDPipe()) id: string): Promise<Contract> {
    return this.svc.rescind(id);
  }

  @Post(':id/amend')
  @Roles('ADMIN', 'GERENTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Modificar contrato firmado — crea nueva versión vinculada, marca anterior MODIFICADO' })
  amend(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AmendContractDto,
  ): Promise<Contract> {
    return this.svc.amend(id, dto);
  }
}

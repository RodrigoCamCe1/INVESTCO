import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { POStatus, PurchaseOrder } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { CreatePoDto } from './dto/create-po.dto';
import { ListPosQueryDto } from './dto/list-pos.query';
import { PurchaseOrdersService } from './purchase-orders.service';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly svc: PurchaseOrdersService) {}

  @Get()
  list(@Query() q: ListPosQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<PurchaseOrder> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS', 'ENCARG_PRESUPUESTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear OC BORRADOR con líneas. Total computado.' })
  create(@Body() dto: CreatePoDto): Promise<PurchaseOrder> {
    return this.svc.create(dto);
  }

  @Patch(':id/submit-approval')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS')
  @ApiOperation({ summary: 'BORRADOR → EN_APROBACION' })
  submitApproval(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.svc.transition(id, POStatus.EN_APROBACION, u);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'EN_APROBACION → APROBADA (registra approvedBy/approvedAt)' })
  approve(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.svc.transition(id, POStatus.APROBADA, u);
  }

  @Patch(':id/send')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS')
  @ApiOperation({ summary: 'APROBADA → ENVIADA (envía a proveedor)' })
  send(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.svc.transition(id, POStatus.ENVIADA, u);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Cancelar OC' })
  cancel(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.svc.transition(id, POStatus.CANCELADA, u);
  }
}

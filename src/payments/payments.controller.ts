import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Payment } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.query';
import { PaymentsService, PaymentsSummary } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Get('payments')
  list(@Query() q: ListPaymentsQueryDto) {
    return this.svc.list(q);
  }

  @Get('payments/:id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Payment> {
    return this.svc.findById(id);
  }

  @Post('payments')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PRESUPUESTO', 'ENCARG_COMPRAS', 'SECRETARIA')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar pago polimórfico (valida FKs según type)' })
  create(@Body() dto: CreatePaymentDto): Promise<Payment> {
    return this.svc.create(dto);
  }

  @Get('projects/:projectId/payments-summary')
  @ApiOperation({ summary: 'Resumen ingresos/egresos + balance + saldo pendiente vs contrato' })
  projectSummary(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<PaymentsSummary> {
    return this.svc.projectSummary(projectId);
  }
}

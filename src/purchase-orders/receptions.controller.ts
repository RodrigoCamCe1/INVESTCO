import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MaterialReception } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { CreateReceptionDto } from './dto/create-reception.dto';
import { ReceptionsService } from './receptions.service';

@ApiTags('purchase-orders')
@ApiBearerAuth()
@Controller('purchase-orders/:purchaseOrderId/receptions')
export class ReceptionsController {
  constructor(private readonly svc: ReceptionsService) {}

  @Get()
  list(@Param('purchaseOrderId', new ParseUUIDPipe()) purchaseOrderId: string) {
    return this.svc.list(purchaseOrderId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_COMPRAS', 'ENCARG_PROYECTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar recepción (parcial o total) — actualiza OC status automático' })
  create(
    @Param('purchaseOrderId', new ParseUUIDPipe()) purchaseOrderId: string,
    @Body() dto: CreateReceptionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MaterialReception> {
    return this.svc.create(purchaseOrderId, dto, user);
  }
}

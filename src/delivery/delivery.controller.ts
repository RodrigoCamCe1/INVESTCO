import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Delivery } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';

@ApiTags('delivery')
@ApiBearerAuth()
@Controller('projects/:projectId/delivery')
export class DeliveryController {
  constructor(private readonly svc: DeliveryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener delivery del proyecto' })
  find(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<Delivery> {
    return this.svc.find(projectId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear acta de entrega (requiere proyecto FINALIZADO)' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateDeliveryDto,
  ): Promise<Delivery> {
    return this.svc.create(projectId, dto);
  }

  @Patch('sign-client')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'CLIENTE')
  @ApiOperation({ summary: 'Firma del cliente' })
  signClient(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<Delivery> {
    return this.svc.signClient(projectId);
  }

  @Patch('sign-company')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Firma de la empresa — si ambos firman, cascada Property+Client→ENTREGADO' })
  signCompany(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<Delivery> {
    return this.svc.signCompany(projectId);
  }
}

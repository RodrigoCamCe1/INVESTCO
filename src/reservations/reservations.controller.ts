import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Reservation } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ListReservationsQueryDto } from './dto/list-reservations.query';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly svc: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reservas' })
  list(@Query() q: ListReservationsQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reserva' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Reservation> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear reserva (cambia Property→RESERVADO + Client→RESERVADO)' })
  create(@Body() dto: CreateReservationDto): Promise<Reservation> {
    return this.svc.create(dto);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN', 'GERENTE', 'VENDEDOR')
  @ApiOperation({ summary: 'Cancelar reserva (libera Property y Client→PROSPECTO)' })
  cancel(@Param('id', new ParseUUIDPipe()) id: string): Promise<Reservation> {
    return this.svc.cancel(id);
  }

  @Post('expire-due')
  @Roles('ADMIN', 'GERENTE')
  @ApiOperation({ summary: 'Vencer manualmente reservas activas con expiresAt < ahora' })
  expireDue() {
    return this.svc.expireDueReservations();
  }
}

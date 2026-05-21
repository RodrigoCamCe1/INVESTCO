import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Meeting } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingsService } from './meetings.service';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients/:clientId/meetings')
export class MeetingsController {
  constructor(private readonly svc: MeetingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar meetings del cliente' })
  list(@Param('clientId', new ParseUUIDPipe()) clientId: string): Promise<Meeting[]> {
    return this.svc.list(clientId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'SECRETARIA', 'VENDEDOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agendar meeting' })
  create(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Body() dto: CreateMeetingDto,
  ): Promise<Meeting> {
    return this.svc.create(clientId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'SECRETARIA', 'VENDEDOR')
  @ApiOperation({ summary: 'Actualizar/reagendar meeting' })
  update(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMeetingDto,
  ): Promise<Meeting> {
    return this.svc.update(clientId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE', 'SECRETARIA')
  @ApiOperation({ summary: 'Cancelar/eliminar meeting' })
  remove(
    @Param('clientId', new ParseUUIDPipe()) clientId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.remove(clientId, id);
  }
}

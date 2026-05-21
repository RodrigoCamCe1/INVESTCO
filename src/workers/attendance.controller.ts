import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Attendance } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AttendanceService, LaborCostSummary } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ListAttendanceQueryDto } from './dto/list-attendance.query';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId')
export class AttendanceController {
  constructor(private readonly svc: AttendanceService) {}

  @Get('attendances')
  list(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Query() q: ListAttendanceQueryDto,
  ) {
    return this.svc.list(projectId, q);
  }

  @Post('attendances')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar asistencia diaria (unique worker+proyecto+date)' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateAttendanceDto,
  ): Promise<Attendance> {
    return this.svc.create(projectId, dto);
  }

  @Get('labor-cost')
  @ApiOperation({ summary: 'Resumen costo MO acumulado (filtros workerId, from, to)' })
  laborCost(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Query() q: ListAttendanceQueryDto,
  ): Promise<LaborCostSummary> {
    return this.svc.laborCost(projectId, q);
  }
}

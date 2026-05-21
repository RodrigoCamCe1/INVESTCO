import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleDependency, ScheduleItem } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDependencyDto } from './dto/create-dependency.dto';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@ApiBearerAuth()
@Controller('projects/:projectId')
export class ScheduleController {
  constructor(private readonly svc: ScheduleService) {}

  @Get('schedule-items')
  listItems(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.svc.listItems(projectId);
  }

  @Post('schedule-items')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  @HttpCode(HttpStatus.CREATED)
  createItem(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateScheduleItemDto,
  ): Promise<ScheduleItem> {
    return this.svc.createItem(projectId, dto);
  }

  @Patch('schedule-items/:id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  updateItem(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateScheduleItemDto,
  ): Promise<ScheduleItem> {
    return this.svc.updateItem(projectId, id, dto);
  }

  @Delete('schedule-items/:id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  deleteItem(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.deleteItem(projectId, id);
  }

  @Post('schedule-dependencies')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear dependencia (FS/SS/FF/SF + lagDays). Valida no ciclos.' })
  addDependency(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateDependencyDto,
  ): Promise<ScheduleDependency> {
    return this.svc.addDependency(projectId, dto);
  }

  @Delete('schedule-dependencies/:id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  removeDependency(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.removeDependency(projectId, id);
  }
}

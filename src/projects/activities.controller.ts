import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Activity } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId/activities')
export class ActivitiesController {
  constructor(private readonly svc: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar activities del proyecto' })
  list(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<Activity[]> {
    return this.svc.list(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de activity con progresses' })
  findOne(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Activity> {
    return this.svc.findOne(projectId, id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear activity' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateActivityDto,
  ): Promise<Activity> {
    return this.svc.create(projectId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  @ApiOperation({ summary: 'Actualizar activity (state machine status)' })
  update(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateActivityDto,
  ): Promise<Activity> {
    return this.svc.update(projectId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Eliminar activity (solo PENDIENTE)' })
  remove(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.remove(projectId, id);
  }
}

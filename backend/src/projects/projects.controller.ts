import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Project } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects.query';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly svc: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proyectos' })
  list(@Query() q: ListProjectsQueryDto) {
    return this.svc.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proyecto con activities y preliminaries' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Project> {
    return this.svc.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear proyecto desde contrato FIRMADO (Property→EN_CONSTRUCCION)' })
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.svc.createFromContract(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Actualizar proyecto (status/stage state machine)' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.svc.update(id, dto);
  }
}

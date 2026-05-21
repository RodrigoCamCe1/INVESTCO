import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Preliminary } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CompletePreliminaryDto } from './dto/complete-preliminary.dto';
import { CreatePreliminaryDto } from './dto/create-preliminary.dto';
import { PreliminariesService } from './preliminaries.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId/preliminaries')
export class PreliminariesController {
  constructor(private readonly svc: PreliminariesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar preliminares' })
  list(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<Preliminary[]> {
    return this.svc.list(projectId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar preliminar' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreatePreliminaryDto,
  ): Promise<Preliminary> {
    return this.svc.create(projectId, dto);
  }

  @Patch(':id/complete')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO')
  @ApiOperation({ summary: 'Marcar preliminar como completada (set completedAt)' })
  complete(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CompletePreliminaryDto,
  ): Promise<Preliminary> {
    return this.svc.complete(projectId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Eliminar preliminar' })
  remove(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.remove(projectId, id);
  }
}

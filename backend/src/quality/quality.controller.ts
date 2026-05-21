import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QualityFinding, QualityInspection } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateFindingDto } from './dto/create-finding.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { QualityService, QualitySummary } from './quality.service';

@ApiTags('quality')
@ApiBearerAuth()
@Controller()
export class QualityController {
  constructor(private readonly svc: QualityService) {}

  @Get('projects/:projectId/quality-inspections')
  @ApiOperation({ summary: 'Listar inspecciones del proyecto' })
  listInspections(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.svc.listInspections(projectId);
  }

  @Post('projects/:projectId/quality-inspections')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_CALIDAD', 'INGENIERO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear inspección de calidad' })
  createInspection(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateInspectionDto,
  ): Promise<QualityInspection> {
    return this.svc.createInspection(projectId, dto);
  }

  @Get('quality-inspections/:id')
  @ApiOperation({ summary: 'Detalle inspección con findings' })
  findInspection(@Param('id', new ParseUUIDPipe()) id: string): Promise<QualityInspection> {
    return this.svc.findInspection(id);
  }

  @Post('quality-inspections/:id/findings')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_CALIDAD', 'INGENIERO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar finding' })
  addFinding(
    @Param('id', new ParseUUIDPipe()) inspectionId: string,
    @Body() dto: CreateFindingDto,
  ): Promise<QualityFinding> {
    return this.svc.addFinding(inspectionId, dto);
  }

  @Patch('quality-inspections/:id/findings/:findingId')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_CALIDAD', 'INGENIERO', 'SUPERVISOR', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Actualizar finding (state machine status)' })
  updateFinding(
    @Param('id', new ParseUUIDPipe()) inspectionId: string,
    @Param('findingId', new ParseUUIDPipe()) findingId: string,
    @Body() dto: UpdateFindingDto,
  ): Promise<QualityFinding> {
    return this.svc.updateFinding(inspectionId, findingId, dto);
  }

  @Get('projects/:projectId/quality-summary')
  @ApiOperation({ summary: 'Resumen calidad (conteos severidad/status, críticos abiertos, vencidos)' })
  summary(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<QualitySummary> {
    return this.svc.summary(projectId);
  }
}

import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MaterialRequirement } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpsertRequirementDto } from './dto/upsert-requirement.dto';
import { RequirementsService } from './requirements.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId/requirements')
export class RequirementsController {
  constructor(private readonly svc: RequirementsService) {}

  @Get()
  list(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.svc.list(projectId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PRESUPUESTO', 'ENCARG_COMPRAS')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upsert requirement (qty/precio planeado para material/proyecto)' })
  upsert(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: UpsertRequirementDto,
  ): Promise<MaterialRequirement> {
    return this.svc.upsert(projectId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PRESUPUESTO')
  remove(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.remove(projectId, id);
  }
}

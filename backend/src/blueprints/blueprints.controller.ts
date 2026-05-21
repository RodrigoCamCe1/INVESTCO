import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlueprintInstallation, BlueprintModel, BlueprintVersion } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { BlueprintsService } from './blueprints.service';
import { CreateBlueprintModelDto } from './dto/create-blueprint-model.dto';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

@ApiTags('blueprints')
@ApiBearerAuth()
@Controller()
export class BlueprintsController {
  constructor(private readonly svc: BlueprintsService) {}

  @Get('blueprint-models')
  list() {
    return this.svc.listModels();
  }

  @Get('blueprint-models/:id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<BlueprintModel> {
    return this.svc.findModel(id);
  }

  @Post('blueprint-models')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateBlueprintModelDto): Promise<BlueprintModel> {
    return this.svc.createModel(dto);
  }

  @Post('blueprint-models/:id/versions')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO', 'INGENIERO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva versión (incrementa versionNumber, marca isCurrent)' })
  createVersion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateVersionDto,
  ): Promise<BlueprintVersion> {
    return this.svc.createVersion(id, dto);
  }

  @Patch('blueprint-versions/:vid')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO', 'INGENIERO')
  @ApiOperation({ summary: 'Actualizar versión con optimistic lock' })
  updateVersion(
    @Param('vid', new ParseUUIDPipe()) vid: string,
    @Body() dto: UpdateVersionDto,
  ): Promise<BlueprintVersion> {
    return this.svc.updateVersion(vid, dto);
  }

  @Patch('blueprint-models/:id/versions/:vid/set-current')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO', 'INGENIERO')
  @ApiOperation({ summary: 'Marcar versión como current' })
  setCurrent(
    @Param('id', new ParseUUIDPipe()) modelId: string,
    @Param('vid', new ParseUUIDPipe()) vid: string,
  ): Promise<BlueprintVersion> {
    return this.svc.setCurrent(modelId, vid);
  }

  @Post('blueprint-versions/:vid/installations')
  @Roles('ADMIN', 'GERENTE', 'ARQUITECTO', 'INGENIERO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar instalación (ELECTRICA/PLOMERIA/etc) a la versión' })
  addInstallation(
    @Param('vid', new ParseUUIDPipe()) vid: string,
    @Body() dto: CreateInstallationDto,
  ): Promise<BlueprintInstallation> {
    return this.svc.addInstallation(vid, dto);
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MaterialUsage } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { CreateUsageDto } from './dto/create-usage.dto';
import { ConsumptionAnalysis, UsagesService } from './usages.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId')
export class UsagesController {
  constructor(private readonly svc: UsagesService) {}

  @Get('usages')
  list(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.svc.list(projectId);
  }

  @Post('usages')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO', 'SUPERVISOR', 'ENCARG_COMPRAS')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar consumo de material en obra' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateUsageDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MaterialUsage> {
    return this.svc.create(projectId, dto, user);
  }

  @Get('material-analysis')
  @ApiOperation({ summary: 'Análisis consumo vs planificado vs avance' })
  analyze(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<ConsumptionAnalysis> {
    return this.svc.analyze(projectId);
  }
}

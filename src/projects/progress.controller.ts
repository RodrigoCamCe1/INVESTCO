import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityProgress } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/jwt-payload.interface';
import { ReportProgressDto } from './dto/report-progress.dto';
import { ProgressService, ProjectProgressSummary } from './progress.service';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId')
export class ProgressController {
  constructor(private readonly svc: ProgressService) {}

  @Get('progress')
  @ApiOperation({ summary: '% avance ponderado del proyecto (total y por stage)' })
  summary(@Param('projectId', new ParseUUIDPipe()) projectId: string): Promise<ProjectProgressSummary> {
    return this.svc.summary(projectId);
  }

  @Post('activities/:activityId/progress')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO', 'INGENIERO', 'SUPERVISOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reportar avance de activity (auto-transición PENDIENTE→EN_CURSO→TERMINADA)' })
  report(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('activityId', new ParseUUIDPipe()) activityId: string,
    @Body() dto: ReportProgressDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActivityProgress> {
    return this.svc.report(projectId, activityId, dto, user);
  }
}

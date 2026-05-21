import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffAssignment } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { EndAssignmentDto } from './dto/end-assignment.dto';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects/:projectId/staff-assignments')
export class AssignmentsController {
  constructor(private readonly svc: AssignmentsService) {}

  @Get()
  list(@Param('projectId', new ParseUUIDPipe()) projectId: string) {
    return this.svc.list(projectId);
  }

  @Post()
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Asignar worker al proyecto' })
  create(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() dto: CreateAssignmentDto,
  ): Promise<StaffAssignment> {
    return this.svc.create(projectId, dto);
  }

  @Patch(':id/end')
  @Roles('ADMIN', 'GERENTE', 'ENCARG_PROYECTO')
  @ApiOperation({ summary: 'Dar de baja asignación' })
  end(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: EndAssignmentDto,
  ): Promise<StaffAssignment> {
    return this.svc.end(projectId, id, dto);
  }
}

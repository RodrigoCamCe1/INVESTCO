import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  imports: [ProjectsModule],
  controllers: [WorkersController, AssignmentsController, AttendanceController],
  providers: [WorkersService, AssignmentsService, AttendanceService],
  exports: [WorkersService],
})
export class WorkersModule {}

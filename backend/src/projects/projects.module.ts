import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { PreliminariesController } from './preliminaries.controller';
import { PreliminariesService } from './preliminaries.service';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [
    ProjectsController,
    ActivitiesController,
    ProgressController,
    PreliminariesController,
  ],
  providers: [ProjectsService, ActivitiesService, ProgressService, PreliminariesService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

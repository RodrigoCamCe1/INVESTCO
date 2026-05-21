import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { RequirementsController } from './requirements.controller';
import { RequirementsService } from './requirements.service';
import { UsagesController } from './usages.controller';
import { UsagesService } from './usages.service';

@Module({
  imports: [ProjectsModule],
  controllers: [MaterialsController, RequirementsController, UsagesController],
  providers: [MaterialsService, RequirementsService, UsagesService],
  exports: [MaterialsService],
})
export class MaterialsModule {}

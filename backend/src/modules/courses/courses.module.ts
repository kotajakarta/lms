import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { MaterialsController } from './materials.controller.js';
import { MaterialsService } from './materials.service.js';

@Module({
  controllers: [CoursesController, MaterialsController],
  providers: [CoursesService, MaterialsService],
})
export class CoursesModule {}

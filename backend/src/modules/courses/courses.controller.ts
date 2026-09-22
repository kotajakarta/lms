import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CourseActor, CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles('admin', 'superadmin', 'siswa', 'instruktur')
  @ApiOperation({ summary: 'Daftar kursus' })
  findAll(@Req() request: { user: CourseActor }) {
    return this.coursesService.findAll(request.user);
  }

  @Get(':id')
  @Roles('admin', 'superadmin', 'siswa', 'instruktur')
  @ApiOperation({ summary: 'Detail kursus' })
  findById(@Param('id', ParseIntPipe) id: number, @Req() request: { user: CourseActor }) {
    return this.coursesService.findById(id, request.user);
  }

  @Post()
  @Roles('admin', 'superadmin', 'instruktur')
  @ApiOperation({ summary: 'Buat kursus baru' })
  create(@Body() dto: CreateCourseDto, @Req() request: { user: CourseActor }) {
    return this.coursesService.create(dto, request.user);
  }

  @Put(':id')
  @Roles('admin', 'superadmin', 'instruktur')
  @ApiOperation({ summary: 'Perbarui kursus' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateCourseDto, @Req() request: { user: CourseActor }) {
    return this.coursesService.update(id, dto, request.user);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin', 'instruktur')
  @ApiOperation({ summary: 'Hapus kursus' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: { user: CourseActor }) {
    return this.coursesService.remove(id, request.user);
  }
}

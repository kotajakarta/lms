import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { MaterialsService } from './materials.service.js';
import { CourseActor } from './courses.service.js';

@ApiTags('Materials')
@Controller('courses/:courseId/materials')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  @Roles('admin', 'superadmin', 'siswa', 'instruktur')
  findAll(@Param('courseId', ParseIntPipe) courseId: number, @Req() request: { user: CourseActor }) { return this.materialsService.findAll(courseId, request.user); }

  @Post()
  @Roles('admin', 'superadmin', 'instruktur')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Buat materi PDF, video upload, atau URL YouTube' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.UPLOAD_DESTINATION || './storage/uploads',
      filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 500) * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      const valid = file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/');
      callback(valid ? null : new BadRequestException('Hanya file PDF atau video yang diperbolehkan'), valid);
    },
  }))
  create(@Param('courseId', ParseIntPipe) courseId: number, @Body() dto: CreateMaterialDto, @Req() request: { user: CourseActor }, @UploadedFile() file?: Express.Multer.File) {
    return this.materialsService.create(courseId, dto, request.user, file);
  }

  @Put(':id')
  @Roles('admin', 'superadmin', 'instruktur')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.UPLOAD_DESTINATION || './storage/uploads',
      filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 500) * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      const valid = file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/');
      callback(valid ? null : new BadRequestException('Hanya file PDF atau video yang diperbolehkan'), valid);
    },
  }))
  update(@Param('courseId', ParseIntPipe) courseId: number, @Param('id', ParseIntPipe) id: number, @Body() dto: CreateMaterialDto, @Req() request: { user: CourseActor }, @UploadedFile() file?: Express.Multer.File) {
    return this.materialsService.update(courseId, id, dto, request.user, file);
  }

  @Delete(':id')
  @Roles('admin', 'superadmin', 'instruktur')
  remove(@Param('courseId', ParseIntPipe) courseId: number, @Param('id', ParseIntPipe) id: number, @Req() request: { user: CourseActor }) { return this.materialsService.remove(courseId, id, request.user); }
}
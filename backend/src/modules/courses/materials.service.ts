import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MaterialType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { CourseActor } from './courses.service.js';

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCourse(courseId: number, actor: CourseActor) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId },
      select: { id: true, instruktur_id: true, course_departments: { select: { department_id: true } } },
    });
    if (!course) throw new NotFoundException('Kursus tidak ditemukan');
    if (actor.role === 'instruktur' && course.instruktur_id !== actor.id && course.course_departments.length > 0) {
      throw new NotFoundException('Kursus tidak ditemukan');
    }
  }

  private async ensureOwnedCourse(courseId: number, actor: CourseActor) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, ...(actor.role === 'instruktur' ? { instruktur_id: actor.id } : {}) }, select: { id: true } });
    if (!course) throw new NotFoundException('Kursus tidak ditemukan');
  }

  async findAll(courseId: number, actor: CourseActor) {
    await this.ensureCourse(courseId, actor);
    return this.prisma.material.findMany({ where: { course_id: courseId }, orderBy: [{ urutan: 'asc' }, { created_at: 'asc' }] });
  }

  async create(courseId: number, dto: CreateMaterialDto, actor: CourseActor, file?: Express.Multer.File) {
    await this.ensureOwnedCourse(courseId, actor);
    if ((dto.tipe === MaterialType.pdf || dto.tipe === MaterialType.video) && !file) {
      throw new BadRequestException('File wajib diunggah untuk materi PDF atau video');
    }
    if (dto.tipe === MaterialType.gdrive_video && !dto.video_url) {
      throw new BadRequestException('URL YouTube wajib diisi untuk materi URL video');
    }
    if (dto.tipe === MaterialType.gdrive_video && dto.video_url) {
      const hostname = new URL(dto.video_url).hostname.replace(/^www\./, '');
      if (hostname !== 'youtube.com' && hostname !== 'youtu.be' && !hostname.endsWith('.youtube.com')) {
        throw new BadRequestException('URL materi harus berasal dari YouTube');
      }
    }
    if (file && dto.tipe === MaterialType.pdf && file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File materi PDF harus berformat PDF');
    }
    if (file && dto.tipe === MaterialType.video && !file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File materi video harus berupa file video');
    }
    return this.prisma.material.create({
      data: {
        course_id: courseId,
        judul: dto.judul,
        deskripsi: dto.deskripsi,
        tipe: dto.tipe,
        video_url: dto.video_url,
        file_path: file ? `/uploads/${file.filename}` : undefined,
        duration_minutes: dto.duration_minutes || 0,
        urutan: dto.urutan || 0,
      },
    });
  }

  async remove(courseId: number, id: number, actor: CourseActor) {
    await this.ensureOwnedCourse(courseId, actor);
    const material = await this.prisma.material.findFirst({ where: { id, course_id: courseId } });
    if (!material) throw new NotFoundException('Materi tidak ditemukan');
    return this.prisma.material.delete({ where: { id } });
  }

  async update(courseId: number, id: number, dto: CreateMaterialDto, actor: CourseActor, file?: Express.Multer.File) {
    await this.ensureOwnedCourse(courseId, actor);
    const material = await this.prisma.material.findFirst({ where: { id, course_id: courseId } });
    if (!material) throw new NotFoundException('Materi tidak ditemukan');
    if (dto.tipe === MaterialType.gdrive_video && !dto.video_url) {
      throw new BadRequestException('URL YouTube wajib diisi untuk materi URL video');
    }
    if (file && dto.tipe === MaterialType.pdf && file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File materi PDF harus berformat PDF');
    }
    if (file && dto.tipe === MaterialType.video && !file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File materi video harus berupa file video');
    }
    if ((dto.tipe === MaterialType.pdf || dto.tipe === MaterialType.video) && !file && !material.file_path) {
      throw new BadRequestException('File wajib diunggah untuk materi PDF atau video');
    }
    return this.prisma.material.update({
      where: { id },
      data: {
        judul: dto.judul,
        deskripsi: dto.deskripsi,
        tipe: dto.tipe,
        video_url: dto.video_url,
        file_path: file ? `/uploads/${file.filename}` : material.file_path,
        duration_minutes: dto.duration_minutes ?? 0,
        urutan: dto.urutan ?? 0,
      },
    });
  }
}
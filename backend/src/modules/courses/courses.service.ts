import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';

export interface CourseActor {
  id: number;
  role: string;
}

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    course_departments: { include: { department: { select: { id: true, nama_jurusan: true } } } },
    _count: { select: { materials: true, enrollments: true, tugas: true, jadwal_kursus: true } },
  } as const;

  findAll(actor: CourseActor) {
    return this.prisma.course.findMany({
      where: actor.role === 'instruktur' ? { OR: [{ instruktur_id: actor.id }, { course_departments: { none: {} } }] } : undefined,
      include: this.include,
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(id: number, actor: CourseActor) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { ...this.include, materials: true, jadwal_kursus: true },
    });
    const isPublic = course?.course_departments.length === 0;
    if (!course || (actor.role === 'instruktur' && course.instruktur_id !== actor.id && !isPublic)) {
      throw new NotFoundException('Kursus tidak ditemukan');
    }
    return course;
  }

  async create(dto: CreateCourseDto, actor: CourseActor) {
    const { department_ids = [], start_date, end_date, ...courseData } = dto;
    return this.prisma.course.create({
      data: {
        ...courseData,
        instruktur_id: actor.role === 'instruktur' ? actor.id : undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        course_departments: {
          create: department_ids.map((department_id) => ({ department_id })),
        },
      },
      include: this.include,
    });
  }

  async update(id: number, dto: CreateCourseDto, actor: CourseActor) {
    await this.findById(id, actor);
    const { department_ids, start_date, end_date, ...courseData } = dto;
    return this.prisma.$transaction(async (transaction: any) => {
      if (department_ids) {
        await transaction.courseDepartment.deleteMany({ where: { course_id: id } });
      }
      return transaction.course.update({
        where: { id },
        data: {
          ...courseData,
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          ...(department_ids ? { course_departments: { create: department_ids.map((department_id) => ({ department_id })) } } : {}),
        },
        include: this.include,
      });
    });
  }

  async remove(id: number, actor: CourseActor) {
    await this.findById(id, actor);
    return this.prisma.course.delete({ where: { id } });
  }
}

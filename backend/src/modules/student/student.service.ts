import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateDiscussionDto } from './dto/create-discussion.dto.js';
import { CreateReplyDto } from './dto/create-reply.dto.js';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        email: true,
        foto: true,
        role: true,
        department: { select: { id: true, nama_jurusan: true } },
        wilayah: { select: { id: true, nama_wilayah: true } },
        cabang: { select: { id: true, nama_cabang: true } },
      },
    });

    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { user_id: userId, status: 'active', course_id: { not: null } },
      orderBy: { last_accessed: 'desc' },
      include: {
        course: {
          include: {
            materials: { orderBy: { urutan: 'asc' } },
            jadwal_kursus: { orderBy: { waktu_mulai: 'asc' } },
            topik_diskusi: {
              orderBy: { created_at: 'desc' },
              take: 5,
              include: {
                user: { select: { id: true, nama: true, foto: true, role: true } },
                _count: { select: { balasan: true } },
              },
            },
          },
        },
      },
    });

    const publicCourses = await this.prisma.course.findMany({
      where: { course_departments: { none: {} }, enrollments: { none: { user_id: userId, status: 'active' } } },
      include: {
        materials: { orderBy: { urutan: 'asc' } },
        topik_diskusi: {
          orderBy: { created_at: 'desc' },
          take: 5,
          include: { user: { select: { id: true, nama: true, foto: true, role: true } }, _count: { select: { balasan: true } } },
        },
      },
    });

    const courseIds = enrollments.map((item) => item.course_id).filter((id): id is number => id !== null);
    const allCourseMaterialIds = [...enrollments.flatMap((item) => item.course?.materials.map((material) => material.id) || []), ...publicCourses.flatMap((course) => course.materials.map((material) => material.id))];
    const materialIds = enrollments.flatMap((item) => item.course?.materials.map((material) => material.id) || []);
    const completedMaterialRows = allCourseMaterialIds.length ? await this.prisma.materialProgress.findMany({ where: { user_id: userId, material_id: { in: allCourseMaterialIds } }, select: { material_id: true } }) : [];
    const completedMaterialIds = new Set(completedMaterialRows.map((row) => row.material_id));
    const completedMaterials = materialIds.length
      ? await this.prisma.materialProgress.count({ where: { user_id: userId, material_id: { in: materialIds } } })
      : 0;

    const courses = enrollments.flatMap((enrollment) => {
      if (!enrollment.course) return [];
      return [{
        id: enrollment.course.id,
        title: enrollment.course.judul,
        description: enrollment.course.deskripsi,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.nama_instruktur,
        progress: enrollment.progress || 0,
        materials: enrollment.course.materials.map((material) => ({
          id: material.id,
          title: material.judul,
          description: material.deskripsi,
          type: material.tipe,
          durationMinutes: material.duration_minutes,
          url: material.video_url || material.file_path,
          order: material.urutan || 0,
          completed: completedMaterialIds.has(material.id),
        })),
        discussions: enrollment.course.topik_diskusi.map((topic) => ({
          id: topic.id,
          title: topic.judul,
          content: topic.isi,
          author: topic.user.nama,
          authorRole: topic.user.role,
          avatar: topic.user.foto,
          replyCount: topic._count.balasan,
          createdAt: topic.created_at,
        })),
      }];
    });

    courses.push(...publicCourses.map((course) => ({
      id: course.id,
      title: course.judul,
      description: course.deskripsi,
      thumbnail: course.thumbnail,
      instructor: course.nama_instruktur,
      progress: 0,
      materials: course.materials.map((material) => ({ id: material.id, title: material.judul, description: material.deskripsi, type: material.tipe, durationMinutes: material.duration_minutes, url: material.video_url || material.file_path, order: material.urutan || 0, completed: completedMaterialIds.has(material.id) })),
      discussions: course.topik_diskusi.map((topic) => ({ id: topic.id, title: topic.judul, content: topic.isi, author: topic.user.nama, authorRole: topic.user.role, avatar: topic.user.foto, replyCount: topic._count.balasan, createdAt: topic.created_at })),
    })));

    const events = enrollments.flatMap((enrollment) => {
      if (!enrollment.course) return [];
      return enrollment.course.jadwal_kursus.map((event) => ({
        id: event.id,
        courseId: event.course_id,
        courseTitle: enrollment.course?.judul,
        title: event.judul,
        description: event.deskripsi,
        type: event.tipe,
        start: event.waktu_mulai,
        end: event.waktu_selesai,
        link: event.link_acara,
      }));
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const totalProgress = enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0);

    return {
      user,
      courses,
      events,
      analytics: {
        activeCourses: courses.length,
        averageProgress: courses.length ? Math.round(totalProgress / courses.length) : 0,
        totalMaterials: materialIds.length,
        completedMaterials,
      },
      generatedAt: new Date(),
    };
  }

  async getDiscussions(userId: number) {
    const enrolledCourses = await this.prisma.enrollment.findMany({
      where: { user_id: userId, status: 'active', course_id: { not: null } },
      select: { course_id: true },
    });
    const courseIds = enrolledCourses.flatMap((enrollment) => enrollment.course_id ? [enrollment.course_id] : []);
    return this.prisma.topikDiskusi.findMany({
      where: { course_id: { in: courseIds } },
      orderBy: { created_at: 'desc' },
      include: {
        course: { select: { id: true, judul: true } },
        user: { select: { id: true, nama: true, foto: true, role: true } },
        balasan: {
          orderBy: { created_at: 'asc' },
          include: { user: { select: { id: true, nama: true, foto: true, role: true } } },
        },
        _count: { select: { balasan: true } },
      },
    });
  }

  async createDiscussion(userId: number, dto: CreateDiscussionDto) {
    const enrollment = await this.prisma.enrollment.findFirst({ where: { user_id: userId, course_id: dto.course_id, status: 'active' } });
    if (!enrollment) throw new NotFoundException('Anda belum terdaftar di kursus ini');
    return this.prisma.topikDiskusi.create({
      data: { course_id: dto.course_id, user_id: userId, judul: dto.judul, isi: dto.isi },
      include: { course: { select: { id: true, judul: true } }, user: { select: { id: true, nama: true, foto: true, role: true } }, _count: { select: { balasan: true } } },
    });
  }

  async createReply(userId: number, dto: CreateReplyDto) {
    const topic = await this.prisma.topikDiskusi.findFirst({
      where: { id: dto.topic_id, course: { enrollments: { some: { user_id: userId, status: 'active' } } } },
      select: { id: true },
    });
    if (!topic) throw new NotFoundException('Topik diskusi tidak ditemukan');
    return this.prisma.balasanDiskusi.create({
      data: { topic_id: dto.topic_id, user_id: userId, isi: dto.isi },
      include: { user: { select: { id: true, nama: true, foto: true, role: true } } },
    });
  }

  async updateMaterialProgress(userId: number, materialId: number, completed: boolean) {
    const material = await this.prisma.material.findUnique({ where: { id: materialId }, select: { id: true, course_id: true, course: { select: { course_departments: { select: { department_id: true } } } } } });
    if (!material) throw new NotFoundException('Materi tidak ditemukan');
    const enrollment = await this.prisma.enrollment.findFirst({ where: { user_id: userId, course_id: material.course_id, status: 'active' } });
    const isPublic = material.course.course_departments.length === 0;
    if (!enrollment && !isPublic) throw new NotFoundException('Anda belum terdaftar di kursus ini');
    if (completed) {
      await this.prisma.materialProgress.upsert({ where: { user_id_material_id: { user_id: userId, material_id: materialId } }, update: { completed_at: new Date() }, create: { user_id: userId, material_id: materialId } });
    } else {
      await this.prisma.materialProgress.deleteMany({ where: { user_id: userId, material_id: materialId } });
    }
    const courseMaterials = await this.prisma.material.count({ where: { course_id: material.course_id } });
    const completedCount = await this.prisma.materialProgress.count({ where: { user_id: userId, material: { course_id: material.course_id } } });
    const progress = courseMaterials ? Math.round((completedCount / courseMaterials) * 100) : 0;
    if (enrollment) await this.prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress, last_accessed: new Date() } });
    else if (isPublic) await this.prisma.enrollment.create({ data: { user_id: userId, course_id: material.course_id, status: 'active', progress, last_accessed: new Date() } });
    return { materialId, completed, progress };
  }
}

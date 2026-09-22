var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    include = {
        course_departments: { include: { department: { select: { id: true, nama_jurusan: true } } } },
        _count: { select: { materials: true, enrollments: true, tugas: true, jadwal_kursus: true } },
    };
    findAll(actor) {
        return this.prisma.course.findMany({
            where: actor.role === 'instruktur' ? { OR: [{ instruktur_id: actor.id }, { course_departments: { none: {} } }] } : undefined,
            include: this.include,
            orderBy: { created_at: 'desc' },
        });
    }
    async findById(id, actor) {
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
    async create(dto, actor) {
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
    async update(id, dto, actor) {
        await this.findById(id, actor);
        const { department_ids, start_date, end_date, ...courseData } = dto;
        return this.prisma.$transaction(async (transaction) => {
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
    async remove(id, actor) {
        await this.findById(id, actor);
        return this.prisma.course.delete({ where: { id } });
    }
};
CoursesService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], CoursesService);
export { CoursesService };
//# sourceMappingURL=courses.service.js.map
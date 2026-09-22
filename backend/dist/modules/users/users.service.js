var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, BadRequestException, ConflictException, } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { search, role, department_id, wilayah_id, cabang_id, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { nama: { contains: search } },
                { email: { contains: search } },
            ];
        }
        if (role)
            where.role = role;
        if (department_id)
            where.department_id = department_id;
        if (wilayah_id)
            where.wilayah_id = wilayah_id;
        if (cabang_id)
            where.cabang_id = cabang_id;
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    nama: true,
                    email: true,
                    role: true,
                    foto: true,
                    department_id: true,
                    wilayah_id: true,
                    cabang_id: true,
                    two_factor_enabled: true,
                    last_login: true,
                    created_at: true,
                    department: { select: { id: true, nama_jurusan: true } },
                    wilayah: { select: { id: true, nama_wilayah: true } },
                    cabang: { select: { id: true, nama_cabang: true } },
                },
                orderBy: { created_at: 'desc' },
            }),
        ]);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                foto: true,
                department_id: true,
                wilayah_id: true,
                cabang_id: true,
                two_factor_enabled: true,
                last_login: true,
                created_at: true,
                department: { select: { id: true, nama_jurusan: true } },
                wilayah: { select: { id: true, nama_wilayah: true } },
                cabang: { select: { id: true, nama_cabang: true } },
            },
        });
        if (!user) {
            throw new NotFoundException('Pengguna tidak ditemukan');
        }
        return user;
    }
    async create(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email sudah terdaftar di sistem');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...dto,
                password: hashedPassword,
            },
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                department_id: true,
                wilayah_id: true,
                cabang_id: true,
                created_at: true,
            },
        });
        return user;
    }
    async update(id, dto) {
        await this.findById(id);
        if (dto.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (existing && existing.id !== id) {
                throw new ConflictException('Email sudah digunakan oleh pengguna lain');
            }
        }
        const data = { ...dto };
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }
        else {
            delete data.password;
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                foto: true,
                department_id: true,
                wilayah_id: true,
                cabang_id: true,
                created_at: true,
            },
        });
        return updated;
    }
    async delete(id, currentUserId) {
        if (id === currentUserId) {
            throw new BadRequestException('Anda tidak dapat menghapus akun Anda sendiri');
        }
        const user = await this.findById(id);
        if (user.role === 'superadmin') {
            const superadminCount = await this.prisma.user.count({
                where: { role: 'superadmin' },
            });
            if (superadminCount <= 1) {
                throw new BadRequestException('Tidak dapat menghapus satu-satunya Superadmin di sistem');
            }
        }
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async updateProfile(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new NotFoundException('Pengguna tidak ditemukan');
        const data = {};
        if (dto.nama)
            data.nama = dto.nama;
        if (dto.new_password) {
            if (!dto.old_password) {
                throw new BadRequestException('Password lama wajib diisi untuk mengganti password');
            }
            const isMatch = await bcrypt.compare(dto.old_password, user.password);
            if (!isMatch) {
                throw new BadRequestException('Password lama salah');
            }
            data.password = await bcrypt.hash(dto.new_password, 10);
        }
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                foto: true,
            },
        });
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map
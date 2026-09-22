import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { QueryUsersDto } from './dto/query-users.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUsersDto) {
    const { search, role, department_id, wilayah_id, cabang_id, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) where.role = role;
    if (department_id) where.department_id = department_id;
    if (wilayah_id) where.wilayah_id = wilayah_id;
    if (cabang_id) where.cabang_id = cabang_id;

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

  async findById(id: number) {
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

  async create(dto: CreateUserDto) {
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

  async update(id: number, dto: UpdateUserDto) {
    await this.findById(id);

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email sudah digunakan oleh pengguna lain');
      }
    }

    const data: any = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    } else {
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

  async delete(id: number, currentUserId: number) {
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

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    const data: any = {};
    if (dto.nama) data.nama = dto.nama;

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
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateWilayahDto } from './dto/create-wilayah.dto.js';
import { CreateCabangDto } from './dto/create-cabang.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';

@Injectable()
export class MasterDataService {
  constructor(private prisma: PrismaService) {}

  // ---------------- Wilayah ----------------
  async getWilayah() {
    return this.prisma.wilayah.findMany({
      include: {
        _count: {
          select: { cabang: true, users: true },
        },
      },
      orderBy: { nama_wilayah: 'asc' },
    });
  }

  async getWilayahById(id: number) {
    const item = await this.prisma.wilayah.findUnique({
      where: { id },
      include: { cabang: true },
    });
    if (!item) throw new NotFoundException('Wilayah tidak ditemukan');
    return item;
  }

  async createWilayah(dto: CreateWilayahDto) {
    return this.prisma.wilayah.create({
      data: dto,
    });
  }

  async updateWilayah(id: number, dto: Partial<CreateWilayahDto>) {
    await this.getWilayahById(id);
    return this.prisma.wilayah.update({
      where: { id },
      data: dto,
    });
  }

  async deleteWilayah(id: number) {
    await this.getWilayahById(id);
    return this.prisma.wilayah.delete({
      where: { id },
    });
  }

  // ---------------- Cabang ----------------
  async getCabang(wilayahId?: number) {
    return this.prisma.cabang.findMany({
      where: wilayahId ? { wilayah_id: wilayahId } : undefined,
      include: {
        wilayah: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { nama_cabang: 'asc' },
    });
  }

  async getCabangById(id: number) {
    const item = await this.prisma.cabang.findUnique({
      where: { id },
      include: { wilayah: true },
    });
    if (!item) throw new NotFoundException('Cabang tidak ditemukan');
    return item;
  }

  async createCabang(dto: CreateCabangDto) {
    return this.prisma.cabang.create({
      data: dto,
      include: { wilayah: true },
    });
  }

  async updateCabang(id: number, dto: Partial<CreateCabangDto>) {
    await this.getCabangById(id);
    return this.prisma.cabang.update({
      where: { id },
      data: dto,
      include: { wilayah: true },
    });
  }

  async deleteCabang(id: number) {
    await this.getCabangById(id);
    return this.prisma.cabang.delete({
      where: { id },
    });
  }

  // ---------------- Department / Jurusan ----------------
  async getDepartments() {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: { users: true, course_departments: true },
        },
      },
      orderBy: { nama_jurusan: 'asc' },
    });
  }

  async getDepartmentById(id: number) {
    const item = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Jurusan/Department tidak ditemukan');
    return item;
  }

  async createDepartment(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: dto,
    });
  }

  async updateDepartment(id: number, dto: Partial<CreateDepartmentDto>) {
    await this.getDepartmentById(id);
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDepartment(id: number) {
    await this.getDepartmentById(id);
    return this.prisma.department.delete({
      where: { id },
    });
  }
}

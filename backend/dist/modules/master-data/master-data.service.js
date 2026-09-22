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
let MasterDataService = class MasterDataService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async getWilayahById(id) {
        const item = await this.prisma.wilayah.findUnique({
            where: { id },
            include: { cabang: true },
        });
        if (!item)
            throw new NotFoundException('Wilayah tidak ditemukan');
        return item;
    }
    async createWilayah(dto) {
        return this.prisma.wilayah.create({
            data: dto,
        });
    }
    async updateWilayah(id, dto) {
        await this.getWilayahById(id);
        return this.prisma.wilayah.update({
            where: { id },
            data: dto,
        });
    }
    async deleteWilayah(id) {
        await this.getWilayahById(id);
        return this.prisma.wilayah.delete({
            where: { id },
        });
    }
    async getCabang(wilayahId) {
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
    async getCabangById(id) {
        const item = await this.prisma.cabang.findUnique({
            where: { id },
            include: { wilayah: true },
        });
        if (!item)
            throw new NotFoundException('Cabang tidak ditemukan');
        return item;
    }
    async createCabang(dto) {
        return this.prisma.cabang.create({
            data: dto,
            include: { wilayah: true },
        });
    }
    async updateCabang(id, dto) {
        await this.getCabangById(id);
        return this.prisma.cabang.update({
            where: { id },
            data: dto,
            include: { wilayah: true },
        });
    }
    async deleteCabang(id) {
        await this.getCabangById(id);
        return this.prisma.cabang.delete({
            where: { id },
        });
    }
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
    async getDepartmentById(id) {
        const item = await this.prisma.department.findUnique({
            where: { id },
        });
        if (!item)
            throw new NotFoundException('Jurusan/Department tidak ditemukan');
        return item;
    }
    async createDepartment(dto) {
        return this.prisma.department.create({
            data: dto,
        });
    }
    async updateDepartment(id, dto) {
        await this.getDepartmentById(id);
        return this.prisma.department.update({
            where: { id },
            data: dto,
        });
    }
    async deleteDepartment(id) {
        await this.getDepartmentById(id);
        return this.prisma.department.delete({
            where: { id },
        });
    }
};
MasterDataService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], MasterDataService);
export { MasterDataService };
//# sourceMappingURL=master-data.service.js.map
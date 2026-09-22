var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service.js';
import { CreateWilayahDto } from './dto/create-wilayah.dto.js';
import { CreateCabangDto } from './dto/create-cabang.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
let MasterDataController = class MasterDataController {
    masterDataService;
    constructor(masterDataService) {
        this.masterDataService = masterDataService;
    }
    async getWilayah() {
        return this.masterDataService.getWilayah();
    }
    async getWilayahById(id) {
        return this.masterDataService.getWilayahById(id);
    }
    async createWilayah(dto) {
        return this.masterDataService.createWilayah(dto);
    }
    async updateWilayah(id, dto) {
        return this.masterDataService.updateWilayah(id, dto);
    }
    async deleteWilayah(id) {
        return this.masterDataService.deleteWilayah(id);
    }
    async getCabang(wilayahId) {
        const wId = wilayahId ? parseInt(wilayahId, 10) : undefined;
        return this.masterDataService.getCabang(wId);
    }
    async getCabangById(id) {
        return this.masterDataService.getCabangById(id);
    }
    async createCabang(dto) {
        return this.masterDataService.createCabang(dto);
    }
    async updateCabang(id, dto) {
        return this.masterDataService.updateCabang(id, dto);
    }
    async deleteCabang(id) {
        return this.masterDataService.deleteCabang(id);
    }
    async getDepartments() {
        return this.masterDataService.getDepartments();
    }
    async getDepartmentById(id) {
        return this.masterDataService.getDepartmentById(id);
    }
    async createDepartment(dto) {
        return this.masterDataService.createDepartment(dto);
    }
    async updateDepartment(id, dto) {
        return this.masterDataService.updateDepartment(id, dto);
    }
    async deleteDepartment(id) {
        return this.masterDataService.deleteDepartment(id);
    }
};
__decorate([
    Get('wilayah'),
    ApiOperation({ summary: 'Daftar semua wilayah' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getWilayah", null);
__decorate([
    Get('wilayah/:id'),
    ApiOperation({ summary: 'Detail wilayah by ID' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getWilayahById", null);
__decorate([
    Post('wilayah'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Tambah wilayah baru' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateWilayahDto]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "createWilayah", null);
__decorate([
    Put('wilayah/:id'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Update wilayah' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "updateWilayah", null);
__decorate([
    Delete('wilayah/:id'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Hapus wilayah' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "deleteWilayah", null);
__decorate([
    Get('cabang'),
    ApiOperation({ summary: 'Daftar cabang (opsional filter ?wilayah_id=)' }),
    __param(0, Query('wilayah_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getCabang", null);
__decorate([
    Get('cabang/:id'),
    ApiOperation({ summary: 'Detail cabang by ID' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getCabangById", null);
__decorate([
    Post('cabang'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Tambah cabang baru' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCabangDto]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "createCabang", null);
__decorate([
    Put('cabang/:id'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Update cabang' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "updateCabang", null);
__decorate([
    Delete('cabang/:id'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Hapus cabang' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "deleteCabang", null);
__decorate([
    Get('departments'),
    ApiOperation({ summary: 'Daftar semua jurusan/department' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getDepartments", null);
__decorate([
    Get('departments/:id'),
    ApiOperation({ summary: 'Detail jurusan by ID' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "getDepartmentById", null);
__decorate([
    Post('departments'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Tambah jurusan baru' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "createDepartment", null);
__decorate([
    Put('departments/:id'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Update jurusan' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "updateDepartment", null);
__decorate([
    Delete('departments/:id'),
    Roles('admin', 'superadmin'),
    ApiOperation({ summary: 'Hapus jurusan' }),
    __param(0, Param('id', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MasterDataController.prototype, "deleteDepartment", null);
MasterDataController = __decorate([
    ApiTags('Master Data'),
    Controller('master'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    __metadata("design:paramtypes", [MasterDataService])
], MasterDataController);
export { MasterDataController };
//# sourceMappingURL=master-data.controller.js.map
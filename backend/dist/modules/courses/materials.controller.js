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
let MaterialsController = class MaterialsController {
    materialsService;
    constructor(materialsService) {
        this.materialsService = materialsService;
    }
    findAll(courseId, request) { return this.materialsService.findAll(courseId, request.user); }
    create(courseId, dto, request, file) {
        return this.materialsService.create(courseId, dto, request.user, file);
    }
    update(courseId, id, dto, request, file) {
        return this.materialsService.update(courseId, id, dto, request.user, file);
    }
    remove(courseId, id, request) { return this.materialsService.remove(courseId, id, request.user); }
};
__decorate([
    Get(),
    Roles('admin', 'superadmin', 'siswa', 'instruktur'),
    __param(0, Param('courseId', ParseIntPipe)),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findAll", null);
__decorate([
    Post(),
    Roles('admin', 'superadmin', 'instruktur'),
    ApiConsumes('multipart/form-data'),
    ApiOperation({ summary: 'Buat materi PDF, video upload, atau URL YouTube' }),
    UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: process.env.UPLOAD_DESTINATION || './storage/uploads',
            filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
        }),
        limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 500) * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            const valid = file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/');
            callback(valid ? null : new BadRequestException('Hanya file PDF atau video yang diperbolehkan'), valid);
        },
    })),
    __param(0, Param('courseId', ParseIntPipe)),
    __param(1, Body()),
    __param(2, Req()),
    __param(3, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateMaterialDto, Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "create", null);
__decorate([
    Put(':id'),
    Roles('admin', 'superadmin', 'instruktur'),
    ApiConsumes('multipart/form-data'),
    UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: process.env.UPLOAD_DESTINATION || './storage/uploads',
            filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
        }),
        limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB || 500) * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            const valid = file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/');
            callback(valid ? null : new BadRequestException('Hanya file PDF atau video yang diperbolehkan'), valid);
        },
    })),
    __param(0, Param('courseId', ParseIntPipe)),
    __param(1, Param('id', ParseIntPipe)),
    __param(2, Body()),
    __param(3, Req()),
    __param(4, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, CreateMaterialDto, Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles('admin', 'superadmin', 'instruktur'),
    __param(0, Param('courseId', ParseIntPipe)),
    __param(1, Param('id', ParseIntPipe)),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "remove", null);
MaterialsController = __decorate([
    ApiTags('Materials'),
    Controller('courses/:courseId/materials'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    __metadata("design:paramtypes", [MaterialsService])
], MaterialsController);
export { MaterialsController };
//# sourceMappingURL=materials.controller.js.map
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
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
let CoursesController = class CoursesController {
    coursesService;
    constructor(coursesService) {
        this.coursesService = coursesService;
    }
    findAll(request) {
        return this.coursesService.findAll(request.user);
    }
    findById(id, request) {
        return this.coursesService.findById(id, request.user);
    }
    create(dto, request) {
        return this.coursesService.create(dto, request.user);
    }
    update(id, dto, request) {
        return this.coursesService.update(id, dto, request.user);
    }
    remove(id, request) {
        return this.coursesService.remove(id, request.user);
    }
};
__decorate([
    Get(),
    Roles('admin', 'superadmin', 'siswa', 'instruktur'),
    ApiOperation({ summary: 'Daftar kursus' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "findAll", null);
__decorate([
    Get(':id'),
    Roles('admin', 'superadmin', 'siswa', 'instruktur'),
    ApiOperation({ summary: 'Detail kursus' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "findById", null);
__decorate([
    Post(),
    Roles('admin', 'superadmin', 'instruktur'),
    ApiOperation({ summary: 'Buat kursus baru' }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCourseDto, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "create", null);
__decorate([
    Put(':id'),
    Roles('admin', 'superadmin', 'instruktur'),
    ApiOperation({ summary: 'Perbarui kursus' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, CreateCourseDto, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles('admin', 'superadmin', 'instruktur'),
    ApiOperation({ summary: 'Hapus kursus' }),
    __param(0, Param('id', ParseIntPipe)),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CoursesController.prototype, "remove", null);
CoursesController = __decorate([
    ApiTags('Courses'),
    Controller('courses'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    __metadata("design:paramtypes", [CoursesService])
], CoursesController);
export { CoursesController };
//# sourceMappingURL=courses.controller.js.map
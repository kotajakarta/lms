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
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { StudentService } from './student.service.js';
import { CreateDiscussionDto } from './dto/create-discussion.dto.js';
import { CreateReplyDto } from './dto/create-reply.dto.js';
import { UpdateMaterialProgressDto } from './dto/update-material-progress.dto.js';
let StudentController = class StudentController {
    studentService;
    constructor(studentService) {
        this.studentService = studentService;
    }
    async getOverview(req) {
        return this.studentService.getOverview(req.user.id);
    }
    getDiscussions(req) { return this.studentService.getDiscussions(req.user.id); }
    createDiscussion(req, dto) { return this.studentService.createDiscussion(req.user.id, dto); }
    createReply(req, dto) { return this.studentService.createReply(req.user.id, dto); }
    updateMaterialProgress(req, materialId, dto) {
        return this.studentService.updateMaterialProgress(req.user.id, materialId, dto.completed);
    }
    removeMaterialProgress(req, materialId) {
        return this.studentService.updateMaterialProgress(req.user.id, materialId, false);
    }
};
__decorate([
    Get('overview'),
    Roles('siswa'),
    ApiOperation({ summary: 'Ringkasan pembelajaran siswa dari enrollment aktif' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getOverview", null);
__decorate([
    Get('discussions'),
    Roles('siswa'),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getDiscussions", null);
__decorate([
    Post('discussions'),
    Roles('siswa'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateDiscussionDto]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "createDiscussion", null);
__decorate([
    Post('discussion-replies'),
    Roles('siswa'),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateReplyDto]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "createReply", null);
__decorate([
    Post('materials/:materialId/progress'),
    Roles('siswa'),
    __param(0, Req()),
    __param(1, Param('materialId', ParseIntPipe)),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, UpdateMaterialProgressDto]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "updateMaterialProgress", null);
__decorate([
    Delete('materials/:materialId/progress'),
    Roles('siswa'),
    __param(0, Req()),
    __param(1, Param('materialId', ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "removeMaterialProgress", null);
StudentController = __decorate([
    ApiTags('Student'),
    Controller('student'),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    __metadata("design:paramtypes", [StudentService])
], StudentController);
export { StudentController };
//# sourceMappingURL=student.controller.js.map
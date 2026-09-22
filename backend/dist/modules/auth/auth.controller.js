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
import { Controller, Post, Get, Body, Req, UseGuards, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Verify2FaDto } from './dto/verify-2fa.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Enable2FaDto } from './dto/enable-2fa.dto.js';
import { Disable2FaDto } from './dto/disable-2fa.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto, req) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        return this.authService.login(loginDto, ip, userAgent);
    }
    async verify2Fa(dto, req) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        return this.authService.verify2Fa(dto, ip, userAgent);
    }
    async refreshToken(dto) {
        return this.authService.refreshToken(dto.refresh_token);
    }
    async getProfile(req) {
        return this.authService.getProfile(req.user.id);
    }
    async setup2Fa(req) {
        return this.authService.setup2Fa(req.user.id);
    }
    async enable2Fa(req, dto) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        return this.authService.enable2Fa(req.user.id, dto.code, ip, userAgent);
    }
    async disable2Fa(req, dto) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        return this.authService.disable2Fa(req.user.id, dto.password, ip, userAgent);
    }
};
__decorate([
    Post('login'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Login pengguna dengan email dan password' }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    Post('verify-2fa'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Verifikasi kode 2FA Google Authenticator saat login' }),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Verify2FaDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2Fa", null);
__decorate([
    Post('refresh-token'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Memperbarui access token dengan refresh token' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    Get('me'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mendapatkan profil pengguna yang sedang login' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    Post('2fa/setup'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Inisialisasi secret & QR Code Google Authenticator' }),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2Fa", null);
__decorate([
    Post('2fa/enable'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Mengaktifkan 2FA setelah konfirmasi 6 digit kode OTP' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Enable2FaDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "enable2Fa", null);
__decorate([
    Post('2fa/disable'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Menonaktifkan 2FA dengan konfirmasi password' }),
    __param(0, Req()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Disable2FaDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable2Fa", null);
AuthController = __decorate([
    ApiTags('Auth'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map
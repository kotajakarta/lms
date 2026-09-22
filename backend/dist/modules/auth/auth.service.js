var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException, BadRequestException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service.js';
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new UnauthorizedException('Email atau password salah');
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Email atau password salah');
        }
        return user;
    }
    async login(loginDto, ipAddress, userAgent) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (user.two_factor_enabled && user.two_factor_secret) {
            const tempToken = this.jwtService.sign({ sub: user.id, is_2fa_pending: true }, { expiresIn: '5m' });
            return {
                requires_2fa: true,
                temp_token: tempToken,
                message: 'Masukkan kode 2FA Google Authenticator Anda',
            };
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                last_login: new Date(),
                last_login_ip: ipAddress,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            requires_2fa: false,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                foto: user.foto,
                department_id: user.department_id,
                wilayah_id: user.wilayah_id,
                cabang_id: user.cabang_id,
                two_factor_enabled: user.two_factor_enabled,
            },
        };
    }
    async verify2Fa(dto, ipAddress, userAgent) {
        let payload;
        try {
            payload = this.jwtService.verify(dto.temp_token);
        }
        catch {
            throw new UnauthorizedException('Sesi verifikasi 2FA telah kadaluarsa. Silakan login kembali.');
        }
        if (!payload.is_2fa_pending || !payload.sub) {
            throw new BadRequestException('Token 2FA tidak valid');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || !user.two_factor_secret) {
            throw new UnauthorizedException('User tidak ditemukan atau 2FA belum aktif');
        }
        let isValid = authenticator.verify({
            token: dto.otp_code,
            secret: user.two_factor_secret,
        });
        if (!isValid && user.two_factor_recovery_codes) {
            try {
                const recoveryCodes = JSON.parse(user.two_factor_recovery_codes);
                const codeIndex = recoveryCodes.indexOf(dto.otp_code);
                if (codeIndex !== -1) {
                    isValid = true;
                    recoveryCodes.splice(codeIndex, 1);
                    await this.prisma.user.update({
                        where: { id: user.id },
                        data: { two_factor_recovery_codes: JSON.stringify(recoveryCodes) },
                    });
                }
            }
            catch (err) {
                console.error('Error checking recovery codes:', err);
            }
        }
        await this.prisma.twoFactorLog.create({
            data: {
                user_id: user.id,
                action: isValid ? 'verified' : 'failed',
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });
        if (!isValid) {
            throw new UnauthorizedException('Kode 2FA tidak valid');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                last_login: new Date(),
                last_login_ip: ipAddress,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                foto: user.foto,
                department_id: user.department_id,
                wilayah_id: user.wilayah_id,
                cabang_id: user.cabang_id,
                two_factor_enabled: user.two_factor_enabled,
            },
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
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
                created_at: true,
                department: { select: { id: true, nama_jurusan: true } },
                wilayah: { select: { id: true, nama_wilayah: true } },
                cabang: { select: { id: true, nama_cabang: true } },
            },
        });
        if (!user) {
            throw new UnauthorizedException('Pengguna tidak ditemukan');
        }
        return user;
    }
    async refreshToken(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('REFRESH_TOKEN_SECRET') || 'uzdem-refresh-secret',
            });
        }
        catch {
            throw new UnauthorizedException('Refresh token tidak valid atau telah kedaluwarsa');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new UnauthorizedException('Pengguna tidak ditemukan');
        }
        return this.generateTokens(user.id, user.email, user.role);
    }
    async setup2Fa(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('Pengguna tidak ditemukan');
        }
        const secret = authenticator.generateSecret();
        const appName = 'UZDEM LMS';
        const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);
        const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
        await this.prisma.user.update({
            where: { id: userId },
            data: { two_factor_secret: secret },
        });
        return {
            secret,
            qr_code: qrCodeDataUrl,
            otp_auth_url: otpAuthUrl,
        };
    }
    async enable2Fa(userId, code, ipAddress = '127.0.0.1', userAgent = '') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.two_factor_secret) {
            throw new BadRequestException('Silakan jalankan setup 2FA terlebih dahulu');
        }
        const isValid = authenticator.verify({
            token: code,
            secret: user.two_factor_secret,
        });
        if (!isValid) {
            throw new BadRequestException('Kode 2FA tidak valid');
        }
        const recoveryCodes = [];
        for (let i = 0; i < 8; i++) {
            recoveryCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                two_factor_enabled: true,
                two_factor_recovery_codes: JSON.stringify(recoveryCodes),
            },
        });
        await this.prisma.twoFactorLog.create({
            data: {
                user_id: userId,
                action: 'enabled',
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });
        return {
            message: '2FA Google Authenticator berhasil diaktifkan',
            recovery_codes: recoveryCodes,
        };
    }
    async disable2Fa(userId, pass, ipAddress = '127.0.0.1', userAgent = '') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new UnauthorizedException('Pengguna tidak ditemukan');
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Password konfirmasi salah');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                two_factor_enabled: false,
                two_factor_secret: null,
                two_factor_recovery_codes: null,
            },
        });
        await this.prisma.twoFactorLog.create({
            data: {
                user_id: userId,
                action: 'disabled',
                ip_address: ipAddress,
                user_agent: userAgent,
            },
        });
        return { message: '2FA berhasil dinonaktifkan' };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const access_token = this.jwtService.sign(payload, {
            expiresIn: (this.configService.get('JWT_EXPIRES_IN') || '15m'),
        });
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get('REFRESH_TOKEN_SECRET') || 'uzdem-refresh-secret',
            expiresIn: (this.configService.get('REFRESH_TOKEN_EXPIRES_IN') || '7d'),
        });
        return { access_token, refresh_token };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Verify2FaDto } from './dto/verify-2fa.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Enable2FaDto } from './dto/enable-2fa.dto.js';
import { Disable2FaDto } from './dto/disable-2fa.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna dengan email dan password' })
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi kode 2FA Google Authenticator saat login' })
  async verify2Fa(@Body() dto: Verify2FaDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.verify2Fa(dto, ip, userAgent);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Memperbarui access token dengan refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mendapatkan profil pengguna yang sedang login' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inisialisasi secret & QR Code Google Authenticator' })
  async setup2Fa(@Req() req: any) {
    return this.authService.setup2Fa(req.user.id);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mengaktifkan 2FA setelah konfirmasi 6 digit kode OTP' })
  async enable2Fa(@Req() req: any, @Body() dto: Enable2FaDto) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.enable2Fa(req.user.id, dto.code, ip, userAgent);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Menonaktifkan 2FA dengan konfirmasi password' })
  async disable2Fa(@Req() req: any, @Body() dto: Disable2FaDto) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.disable2Fa(req.user.id, dto.password, ip, userAgent);
  }
}

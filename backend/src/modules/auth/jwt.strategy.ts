import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'uzdem-lms-super-secret-jwt-key-2026',
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan atau sesi telah berakhir');
    }

    return user;
  }
}

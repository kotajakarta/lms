import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

// Ensure .env credentials are fully loaded
if (existsSync(resolve('backend/.env'))) {
  dotenv.config({ path: resolve('backend/.env'), override: true });
}
dotenv.config({ override: true });

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      const maskedUrl = process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')
        : 'none';
      console.log(`🔌 Menghubungkan database dari .env: ${maskedUrl}`);
      await this.$connect();
      console.log('✅ Berhasil terhubung ke database.');
    } catch (err: any) {
      console.warn('⚠️ Koneksi database belum tersedia (mode offline/fallback aktif):', err?.message || err);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      // Ignore disconnect error
    }
  }
}

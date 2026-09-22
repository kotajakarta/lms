import dotenv from 'dotenv';
import { resolve, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

// Load credentials and environment variables from .env
if (existsSync(resolve('backend/.env'))) {
  dotenv.config({ path: resolve('backend/.env'), override: true });
}
dotenv.config({ override: true });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { static as expressStatic } from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uploadDirectory = join(process.cwd(), process.env.UPLOAD_DESTINATION || './storage/uploads');
  if (!existsSync(uploadDirectory)) mkdirSync(uploadDirectory, { recursive: true });
  app.getHttpAdapter().getInstance().use('/uploads', expressStatic(uploadDirectory));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('UZDEM LMS API')
    .setDescription('Dokumentasi REST API & WebSocket untuk UZDEM LMS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on: http://0.0.0.0:${port}/api/v1`);
  console.log(`📚 Swagger API Docs:  http://0.0.0.0:${port}/api/docs`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { static as expressStatic } from 'express';
import { AppModule } from './app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const uploadDirectory = join(process.cwd(), process.env.UPLOAD_DESTINATION || './storage/uploads');
    if (!existsSync(uploadDirectory))
        mkdirSync(uploadDirectory, { recursive: true });
    app.getHttpAdapter().getInstance().use('/uploads', expressStatic(uploadDirectory));
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new DocumentBuilder()
        .setTitle('UZDEM LMS API')
        .setDescription('Dokumentasi REST API & WebSocket untuk UZDEM LMS')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Backend running on: http://localhost:${port}/api/v1`);
    console.log(`📚 Swagger API Docs:  http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { MasterDataModule } from './modules/master-data/master-data.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { StudentModule } from './modules/student/student.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    MasterDataModule,
    UsersModule,
    StudentModule,
    CoursesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

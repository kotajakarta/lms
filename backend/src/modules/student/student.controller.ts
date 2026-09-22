import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { StudentService } from './student.service.js';
import { CreateDiscussionDto } from './dto/create-discussion.dto.js';
import { CreateReplyDto } from './dto/create-reply.dto.js';
import { UpdateMaterialProgressDto } from './dto/update-material-progress.dto.js';

@ApiTags('Student')
@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('overview')
  @Roles('siswa')
  @ApiOperation({ summary: 'Ringkasan pembelajaran siswa dari enrollment aktif' })
  async getOverview(@Req() req: any) {
    return this.studentService.getOverview(req.user.id);
  }

  @Get('discussions')
  @Roles('siswa')
  getDiscussions(@Req() req: any) { return this.studentService.getDiscussions(req.user.id); }

  @Post('discussions')
  @Roles('siswa')
  createDiscussion(@Req() req: any, @Body() dto: CreateDiscussionDto) { return this.studentService.createDiscussion(req.user.id, dto); }

  @Post('discussion-replies')
  @Roles('siswa')
  createReply(@Req() req: any, @Body() dto: CreateReplyDto) { return this.studentService.createReply(req.user.id, dto); }

  @Post('materials/:materialId/progress')
  @Roles('siswa')
  updateMaterialProgress(@Req() req: any, @Param('materialId', ParseIntPipe) materialId: number, @Body() dto: UpdateMaterialProgressDto) {
    return this.studentService.updateMaterialProgress(req.user.id, materialId, dto.completed);
  }

  @Delete('materials/:materialId/progress')
  @Roles('siswa')
  removeMaterialProgress(@Req() req: any, @Param('materialId', ParseIntPipe) materialId: number) {
    return this.studentService.updateMaterialProgress(req.user.id, materialId, false);
  }
}

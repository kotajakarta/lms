import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MasterDataService } from './master-data.service.js';
import { CreateWilayahDto } from './dto/create-wilayah.dto.js';
import { CreateCabangDto } from './dto/create-cabang.dto.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@ApiTags('Master Data')
@Controller('master')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  // ---------------- Wilayah ----------------
  @Get('wilayah')
  @ApiOperation({ summary: 'Daftar semua wilayah' })
  async getWilayah() {
    return this.masterDataService.getWilayah();
  }

  @Get('wilayah/:id')
  @ApiOperation({ summary: 'Detail wilayah by ID' })
  async getWilayahById(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.getWilayahById(id);
  }

  @Post('wilayah')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Tambah wilayah baru' })
  async createWilayah(@Body() dto: CreateWilayahDto) {
    return this.masterDataService.createWilayah(dto);
  }

  @Put('wilayah/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update wilayah' })
  async updateWilayah(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateWilayahDto>,
  ) {
    return this.masterDataService.updateWilayah(id, dto);
  }

  @Delete('wilayah/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus wilayah' })
  async deleteWilayah(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.deleteWilayah(id);
  }

  // ---------------- Cabang ----------------
  @Get('cabang')
  @ApiOperation({ summary: 'Daftar cabang (opsional filter ?wilayah_id=)' })
  async getCabang(@Query('wilayah_id') wilayahId?: string) {
    const wId = wilayahId ? parseInt(wilayahId, 10) : undefined;
    return this.masterDataService.getCabang(wId);
  }

  @Get('cabang/:id')
  @ApiOperation({ summary: 'Detail cabang by ID' })
  async getCabangById(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.getCabangById(id);
  }

  @Post('cabang')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Tambah cabang baru' })
  async createCabang(@Body() dto: CreateCabangDto) {
    return this.masterDataService.createCabang(dto);
  }

  @Put('cabang/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update cabang' })
  async updateCabang(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateCabangDto>,
  ) {
    return this.masterDataService.updateCabang(id, dto);
  }

  @Delete('cabang/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus cabang' })
  async deleteCabang(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.deleteCabang(id);
  }

  // ---------------- Department / Jurusan ----------------
  @Get('departments')
  @ApiOperation({ summary: 'Daftar semua jurusan/department' })
  async getDepartments() {
    return this.masterDataService.getDepartments();
  }

  @Get('departments/:id')
  @ApiOperation({ summary: 'Detail jurusan by ID' })
  async getDepartmentById(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.getDepartmentById(id);
  }

  @Post('departments')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Tambah jurusan baru' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.masterDataService.createDepartment(dto);
  }

  @Put('departments/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Update jurusan' })
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateDepartmentDto>,
  ) {
    return this.masterDataService.updateDepartment(id, dto);
  }

  @Delete('departments/:id')
  @Roles('admin', 'superadmin')
  @ApiOperation({ summary: 'Hapus jurusan' })
  async deleteDepartment(@Param('id', ParseIntPipe) id: number) {
    return this.masterDataService.deleteDepartment(id);
  }
}

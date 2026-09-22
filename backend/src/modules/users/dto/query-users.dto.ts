import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class QueryUsersDto {
  @ApiPropertyOptional({ description: 'Cari berdasarkan nama atau email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Filter peran' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID Department' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  department_id?: number;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID Wilayah' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  wilayah_id?: number;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID Cabang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cabang_id?: number;

  @ApiPropertyOptional({ default: 1, description: 'Nomor halaman' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, description: 'Batas data per halaman' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}

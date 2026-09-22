import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '@prisma/client';

export class CreateMaterialDto {
  @ApiProperty({ example: 'Pengantar Perspektif' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  judul: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty({ enum: MaterialType })
  @IsEnum(MaterialType)
  tipe: MaterialType;

  @ApiPropertyOptional({ example: 'https://www.youtube.com/watch?v=...' })
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  video_url?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duration_minutes?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  urutan?: number;
}
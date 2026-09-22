import { IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Spatial Design Fundamentals' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  judul: string;

  @ApiPropertyOptional({ example: 'Dasar-dasar berpikir spasial dan desain.' })
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiPropertyOptional({ example: 'default.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'Prof. Elena Rostova' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nama_instruktur?: string;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  department_ids?: number[];
}

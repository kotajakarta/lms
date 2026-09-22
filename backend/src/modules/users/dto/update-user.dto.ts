import { IsOptional, IsString, IsEmail, IsEnum, IsInt, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Budi Santoso', description: 'Nama lengkap pengguna' })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional({ example: 'budi@example.com', description: 'Alamat email aktif' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123', description: 'Password baru (kosongkan jika tidak diubah)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Peran pengguna' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 1, description: 'ID Jurusan/Department' })
  @IsOptional()
  @IsInt()
  department_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID Wilayah' })
  @IsOptional()
  @IsInt()
  wilayah_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID Cabang' })
  @IsOptional()
  @IsInt()
  cabang_id?: number;
}

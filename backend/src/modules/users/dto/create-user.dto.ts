import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Budi Santoso', description: 'Nama lengkap pengguna' })
  @IsNotEmpty()
  @IsString()
  nama: string;

  @ApiProperty({ example: 'budi@example.com', description: 'Alamat email aktif' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password akun (minimal 6 karakter)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, default: Role.siswa, description: 'Peran pengguna (siswa, admin, superadmin)' })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

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

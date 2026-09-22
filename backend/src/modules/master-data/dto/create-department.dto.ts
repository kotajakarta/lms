import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Teknik Komputer & Jaringan', description: 'Nama kejuruan / jurusan' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama_jurusan: string;
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWilayahDto {
  @ApiProperty({ example: 'Jawa Barat', description: 'Nama wilayah organisasi' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama_wilayah: string;
}

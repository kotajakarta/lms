import { IsNotEmpty, IsString, IsInt, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCabangDto {
  @ApiProperty({ example: 'Bandung', description: 'Nama cabang' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nama_cabang: string;

  @ApiProperty({ example: 1, description: 'ID Wilayah induk' })
  @IsNotEmpty()
  @IsInt()
  wilayah_id: number;
}

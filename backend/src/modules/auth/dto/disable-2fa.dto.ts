import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Disable2FaDto {
  @ApiProperty({ example: 'admin123', description: 'Password user untuk konfirmasi nonaktifkan 2FA' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

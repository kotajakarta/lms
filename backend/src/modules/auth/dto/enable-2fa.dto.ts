import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2FaDto {
  @ApiProperty({ example: '123456', description: 'Kode 6 digit OTP Google Authenticator' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}

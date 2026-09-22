import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2FaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  temp_token!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  otp_code!: string;
}

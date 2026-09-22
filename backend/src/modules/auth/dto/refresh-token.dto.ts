import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token JWT yang masih valid' })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

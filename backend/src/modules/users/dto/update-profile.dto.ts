import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Budi Santoso' })
  @IsOptional()
  @IsString()
  nama?: string;

  @ApiPropertyOptional({ example: 'oldpass123' })
  @IsOptional()
  @IsString()
  old_password?: string;

  @ApiPropertyOptional({ example: 'newpass123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  new_password?: string;
}

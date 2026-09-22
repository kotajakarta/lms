import { IsBoolean } from 'class-validator';

export class UpdateMaterialProgressDto {
  @IsBoolean()
  completed: boolean;
}

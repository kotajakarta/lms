import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDiscussionDto {
  @IsInt()
  course_id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  judul: string;

  @IsNotEmpty()
  @IsString()
  isi: string;
}

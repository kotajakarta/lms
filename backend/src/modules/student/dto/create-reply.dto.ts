import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @IsInt()
  topic_id: number;

  @IsNotEmpty()
  @IsString()
  isi: string;
}

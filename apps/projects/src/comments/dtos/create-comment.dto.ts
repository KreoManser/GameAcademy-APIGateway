import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @IsOptional()
  @IsString()
  parent?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

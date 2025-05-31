// src/games/dto/create-game.dto.ts
import { IsString, IsOptional, IsArray, ArrayNotEmpty, ArrayUnique, IsUrl, IsMongoId } from 'class-validator';

export class CreateGameDto {
  @IsString() title: string;

  @IsString() description: string;

  @IsString() uploader: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  genres: string[];

  @IsString() cover: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  authors?: string[];
}

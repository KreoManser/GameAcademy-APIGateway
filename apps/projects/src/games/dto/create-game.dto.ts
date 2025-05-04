// src/games/dto/create-game.dto.ts
import { IsString, IsOptional, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateGameDto {
  @IsString() title: string;

  @IsString() description: string;

  @IsString() uploader: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  genres: string[];

  @IsOptional()
  @IsString()
  cover: string;
}

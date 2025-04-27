/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/games/dto/create-game.dto.ts
import { IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

// src/games/games.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  Body,
  Get,
  Param,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'models', maxCount: 10 },
    ]),
  )
  async uploadGame(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      models?: Express.Multer.File[];
    },
    @Body() createDto: CreateGameDto,
  ) {
    const gameFile = files.file?.[0];
    if (!gameFile) throw new BadRequestException('Game ZIP is required');
    return this.gamesService.create(createDto, gameFile.buffer, files.models);
  }

  @Get()
  async list() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }
}

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
  Query,
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
      { name: 'cover', maxCount: 1 },
      { name: 'models', maxCount: 20 },
      { name: 'images', maxCount: 20 },
      { name: 'videos', maxCount: 10 },
    ]),
  )
  async uploadGame(
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      models?: Express.Multer.File[];
      images?: Express.Multer.File[];
      videos?: Express.Multer.File[];
    },
    @Body() createDto: CreateGameDto,
  ) {
    const coverFile = files.cover?.[0];
    if (!coverFile) throw new BadRequestException('Cover image is required');

    const gameFile = files.file?.[0];
    // Если нет ZIP и нет ссылки — ошибка
    if (!gameFile && !createDto.githubUrl) {
      throw new BadRequestException('Either a ZIP build or a GitHub URL must be provided');
    }

    return this.gamesService.create(
      createDto,
      gameFile?.buffer,
      files.models,
      files.images,
      files.videos,
      coverFile.buffer,
      coverFile.originalname,
      coverFile.mimetype,
      !!gameFile,
    );
  }

  // src/games/games.controller.ts
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('uploader') uploader?: string, // ← добавили
  ) {
    return this.gamesService.findAll(q, uploader);
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }
}

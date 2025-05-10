// src/admin/admin-games.controller.ts
import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { GamesService } from '../games/games.service';

@Controller('admin/games')
export class AdminGamesController {
  constructor(private readonly gamesService: GamesService) {}

  // GET /admin/games
  @Get()
  async listAll() {
    const games = await this.gamesService.findAll();
    // убираем ненужные поля, оставляем минимальный набор
    return {
      games: games.map((g) => ({
        _id: g._id.toString(),
        title: g.title,
        uploader: g.uploader,
      })),
    };
  }

  // POST /admin/games/delete
  @Post('delete')
  async delete(@Body('id') id: string) {
    if (!id) throw new BadRequestException('Id required');
    await this.gamesService.remove(id);
    return { success: true };
  }
}

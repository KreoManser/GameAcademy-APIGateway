// src/admin/admin-games.controller.ts
import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { GamesService } from '../games/games.service';
import { RMQService } from 'nestjs-rmq';
import { AccountUserInfo } from '@shared/contracts';

@Controller('admin/games')
export class AdminGamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly rmqService: RMQService,
  ) {}

  // GET /admin/games
  @Get()
  async listAll() {
    const games = await this.gamesService.findAll();
    const enriched = await Promise.all(
      games.map(async (g) => {
        let uploaderLabel = g.uploader; // fallback — просто id
        try {
          const { profile } = await this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(
            AccountUserInfo.topic,
            { id: g.uploader },
          );
          uploaderLabel = `${profile.displayName} (${profile.email})`;
        } catch {
          // если не удалось, оставляем id или ставим "Unknown"
        }
        return {
          _id: g._id.toString(),
          title: g.title,
          uploader: uploaderLabel,
          createdAt: g.get('createdAt') as Date,
        };
      }),
    );
    return { games: enriched };
  }

  //   createdAt: g.get('createdAt') as Date,
  // POST /admin/games/delete
  @Post('delete')
  async delete(@Body('id') id: string) {
    if (!id) throw new BadRequestException('Id required');
    await this.gamesService.remove(id);
    return { success: true };
  }
}

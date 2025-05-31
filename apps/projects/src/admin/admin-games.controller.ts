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

  @Get()
  async listAll() {
    const games = await this.gamesService.findAll();

    const enriched = await Promise.all(
      games.map(async (g) => {
        const uploaderIdStr = g.uploader.toString();

        let uploaderLabel = uploaderIdStr;
        try {
          const { profile } = await this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(
            AccountUserInfo.topic,
            { id: uploaderIdStr },
          );
          uploaderLabel = `${profile.displayName} (${profile.email})`;
        } catch {
          /* empty */
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

  @Post('delete')
  async delete(@Body('id') id: string) {
    if (!id) throw new BadRequestException('Id required');
    await this.gamesService.remove(id);
    return { success: true };
  }
}

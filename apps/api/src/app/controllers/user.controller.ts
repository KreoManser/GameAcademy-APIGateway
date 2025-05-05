import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccountChangeRole, AccountUserInfo } from '@shared/contracts';
import { RMQService } from 'nestjs-rmq';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../guards/user.decorator';

@Controller('user')
export class UserContoller {
  constructor(private readonly rmqService: RMQService) {}
  @UseGuards(JWTAuthGuard)
  @Post('info')
  async info(@UserId() userId: string): Promise<AccountUserInfo.Response> {
    // посылаем RMQ-запрос в микросервис «user» на получение профиля
    const response = await this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(
      AccountUserInfo.topic,
      { id: userId },
    );
    return response;
  }

  @UseGuards(JWTAuthGuard)
  @Post('change-role')
  async changeRole(@Body() dto: AccountChangeRole.Request) {
    return await this.rmqService.send<AccountChangeRole.Request, AccountChangeRole.Response>(
      AccountChangeRole.topic,
      dto,
    );
  }
}

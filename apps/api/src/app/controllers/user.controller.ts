// api/src/controllers/user.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { AccountUserInfo, AccountChangeRole } from '@shared/contracts';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../guards/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly rmqService: RMQService) {}

  @UseGuards(JWTAuthGuard)
  @Post('info')
  async info(@UserId() userId: string) {
    // тут гарантированно строка
    return this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(AccountUserInfo.topic, {
      id: userId,
    });
  }

  @UseGuards(JWTAuthGuard)
  @Post('change-role')
  async changeRole(@Body() dto: AccountChangeRole.Request): Promise<AccountChangeRole.Response> {
    return this.rmqService.send<AccountChangeRole.Request, AccountChangeRole.Response>(AccountChangeRole.topic, dto);
  }
}

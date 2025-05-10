// api/src/controllers/user.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { AccountUserInfo, AccountChangeRole, UserList, AccountDeleteUser } from '@shared/contracts';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../guards/user.decorator';
import { Roles } from '../guards/roles.guard';
import { UserRole } from '@shared/interfaces';

@Controller('user')
export class UserController {
  rmq: any;
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

  @Get('users')
  @Roles(UserRole.Admin)
  async listUsers(): Promise<UserList.Response> {
    return this.rmqService.send<UserList.Request, UserList.Response>(UserList.topic, {});
  }

  // Смена роли
  @Post('users/change-role')
  @Roles(UserRole.Admin)
  async changeRoleAdmin(@Body() dto: AccountChangeRole.Request): Promise<AccountChangeRole.Response> {
    return this.rmqService.send<AccountChangeRole.Request, AccountChangeRole.Response>(AccountChangeRole.topic, dto);
  }

  @Post('delete')
  async delete(@Body() dto: AccountDeleteUser.Request): Promise<AccountDeleteUser.Response> {
    return this.rmqService.send<AccountDeleteUser.Request, AccountDeleteUser.Response>(AccountDeleteUser.topic, dto);
  }
}

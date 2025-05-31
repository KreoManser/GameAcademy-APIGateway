import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import {
  AccountUserInfo,
  AccountChangeRole,
  UserList,
  AccountDeleteUser,
  UserSearch,
  AccountChangePasswordProfile,
} from '@shared/contracts';
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
  async info(@UserId() userIdFromToken: string, @Body() { id }: AccountUserInfo.Request) {
    return this.rmqService.send<AccountUserInfo.Request, AccountUserInfo.Response>(AccountUserInfo.topic, { id });
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

  @Post('users/change-role')
  @Roles(UserRole.Admin)
  async changeRoleAdmin(@Body() dto: AccountChangeRole.Request): Promise<AccountChangeRole.Response> {
    return this.rmqService.send<AccountChangeRole.Request, AccountChangeRole.Response>(AccountChangeRole.topic, dto);
  }

  @Post('delete')
  async delete(@Body() dto: AccountDeleteUser.Request): Promise<AccountDeleteUser.Response> {
    return this.rmqService.send<AccountDeleteUser.Request, AccountDeleteUser.Response>(AccountDeleteUser.topic, dto);
  }

  @UseGuards(JWTAuthGuard)
  @Get('search')
  async search(@Query('query') query?: string): Promise<UserSearch.Response> {
    return this.rmqService.send<UserSearch.Request, UserSearch.Response>(UserSearch.topic, { query });
  }

  @UseGuards(JWTAuthGuard)
  @Post('change-password')
  async changePassword(
    @UserId() userIdFromToken: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ): Promise<AccountChangePasswordProfile.Response> {
    const { oldPassword, newPassword } = body;
    return this.rmqService.send<AccountChangePasswordProfile.Request, AccountChangePasswordProfile.Response>(
      AccountChangePasswordProfile.topic,
      {
        id: userIdFromToken,
        passwords: { oldPassword, newPassword },
      },
    );
  }
}

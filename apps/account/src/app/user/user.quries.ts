import { Body, Controller } from '@nestjs/common';
import { AccountUserInfo, UserList, UserSearch } from '@shared/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repos/user.repository';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountUserInfo.topic)
  async userInfo(@Body() { id }: AccountUserInfo.Request): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    const profile = new UserEntity(user).getPublicProfile();
    return { profile };
  }

  @RMQValidate()
  @RMQRoute(UserSearch.topic)
  async searchUsers(@Body() dto: UserSearch.Request): Promise<UserSearch.Response> {
    const found = await this.userRepository.searchByDisplayName(dto.query);
    return {
      users: found.map((u) => ({
        _id: u._id.toString(),
        email: u.email,
        displayName: u.displayName,
        role: u.role,
      })),
    };
  }

  @RMQRoute(UserList.topic)
  async listUsers(): Promise<UserList.Response> {
    const users = await this.userRepository.findAllUsers();
    return {
      users: users.map((u) => ({
        email: u.email,
        displayName: u.displayName,
        role: u.role,
      })),
    };
  }
}

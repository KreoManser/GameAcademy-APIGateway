import { Body, Controller } from '@nestjs/common';
import { AccountUserInfo } from '@shared/contracts';
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
}

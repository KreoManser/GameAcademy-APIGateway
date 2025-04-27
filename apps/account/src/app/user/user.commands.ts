import { Body, Controller } from '@nestjs/common';
import { AccountChangeProfile, AccountChangeRole } from '@shared/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { THIS_USER_IS_NOT_EXISTS } from '../auth/others/account.constants';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repos/user.repository';

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async userInfo(@Body() { user, id }: AccountChangeProfile.Request): Promise<AccountChangeProfile.Response> {
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) throw new Error(THIS_USER_IS_NOT_EXISTS);
    const userEntity = new UserEntity(existedUser).updateProfile(user.displayName);
    await this.userRepository.updateUserById(userEntity);
    return { user };
  }

  @RMQValidate()
  @RMQRoute(AccountChangeRole.topic)
  async changeRole(@Body() dto: AccountChangeRole.Request): Promise<AccountChangeRole.Response> {
    const user = await this.userRepository.findUser(dto.email);
    if (!user) throw new Error('Пользователь не найден');

    const userEntity = new UserEntity(user);
    userEntity.role = dto.newRole;
    await this.userRepository.updateUserById(userEntity);
    return { profile: userEntity.getPublicProfile() };
  }
}

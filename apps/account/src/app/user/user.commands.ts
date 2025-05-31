import { Body, Controller } from '@nestjs/common';
import { AccountChangePasswordProfile, AccountChangeProfile, AccountChangeRole } from '@shared/contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { THIS_USER_IS_NOT_EXISTS, WRONG_OLD_PASSWORD } from '../auth/others/account.constants';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repos/user.repository';
import { AccountDeleteUser } from '@shared/contracts';

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

  @RMQValidate()
  @RMQRoute(AccountDeleteUser.topic)
  async deleteUser(@Body() { email }: AccountDeleteUser.Request): Promise<AccountDeleteUser.Response> {
    const user = await this.userRepository.findUser(email);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    await this.userRepository.deleteUser(email);
    return { success: true };
  }

  @RMQValidate()
  @RMQRoute(AccountChangePasswordProfile.topic)
  async changePassword(
    @Body() { id, passwords }: AccountChangePasswordProfile.Request,
  ): Promise<AccountChangePasswordProfile.Response> {
    // 1) Найдём пользователя по id
    const existedUser = await this.userRepository.findUserById(id);
    if (!existedUser) throw new Error(THIS_USER_IS_NOT_EXISTS);

    // 2) Проверим правильность старого пароля
    const userEntity = new UserEntity(existedUser);
    const isOldValid = await userEntity.validatePassword(passwords.oldPassword);
    if (!isOldValid) throw new Error(WRONG_OLD_PASSWORD);

    // 3) Установим новый пароль (хешируется внутри setPassword)
    await userEntity.setPassword(passwords.newPassword);

    // 4) Сохраним в БД
    await this.userRepository.updateUserById(userEntity);

    return { success: true };
  }
}

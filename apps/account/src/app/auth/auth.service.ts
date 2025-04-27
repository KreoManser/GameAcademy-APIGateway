import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountRegister } from '@shared/contracts';
import { UserRole } from '@shared/interfaces';
import { Types } from 'mongoose';
import { UserEntity } from '../user/entities/user.entity';
import { UserRepository } from '../user/repos/user.repository';
import { THIS_USER_IS_EXISTS, WRONG_LOGIN_OR_PASSWORD } from './others/account.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, password, displayName }: AccountRegister.Request): Promise<AccountRegister.Response> {
    const oldUser = await this.userRepository.findUser(email);
    if (oldUser) throw new Error(THIS_USER_IS_EXISTS);
    const newUserEntity = await new UserEntity({
      displayName,
      email,
      role: UserRole.Guest,
    }).setPassword(password);
    const newUser = await this.userRepository.createUser(newUserEntity);
    return { email: newUser.email };
  }

  async validateUser(email: string, password: string): Promise<{ id: Types.ObjectId }> {
    const user = await this.userRepository.findUser(email);
    if (!user) throw new Error(WRONG_LOGIN_OR_PASSWORD);
    const userEntity = new UserEntity(user);
    const isCorrectPassword = await userEntity.validatePassword(password);
    if (!isCorrectPassword) throw new Error(WRONG_LOGIN_OR_PASSWORD);
    return { id: user._id };
  }

  async login(id: string) {
    return {
      access_token: await this.jwtService.signAsync({ id }),
    };
  }
}

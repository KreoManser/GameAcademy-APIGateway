import { IUser, UserRole } from '@shared/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { Types } from 'mongoose';

export class UserEntity implements IUser {
  _id?: Types.ObjectId;
  displayName?: string;
  email: string;
  passwordHash: string;
  role: UserRole;

  constructor(user: Omit<IUser, 'passwordHash'>);
  constructor(user: IUser);

  constructor(user: IUser | Omit<IUser, 'passwordHash'>) {
    this._id = user._id;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;

    if ('passwordHash' in user) {
      this.passwordHash = user.passwordHash;
    }
  }

  public getPublicProfile() {
    return {
      displayName: this.displayName,
      email: this.email,
      role: this.role,
    };
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }
}

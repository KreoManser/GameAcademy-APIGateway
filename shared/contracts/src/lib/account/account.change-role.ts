import { IUser, UserRole } from '@shared/interfaces';
import { IsEnum, IsString } from 'class-validator';

export namespace AccountChangeRole {
  export const topic = 'account.change-role.command';

  export class Request {
    @IsString()
    email: string;

    @IsEnum(UserRole)
    newRole: UserRole;
  }

  export class Response {
    profile: Omit<IUser, 'passwordHash'>;
  }
}

import { IsEmail } from 'class-validator';

export namespace AccountDeleteUser {
  export const topic = 'account.delete-user.command';

  export class Request {
    @IsEmail()
    email: string;
  }

  export class Response {
    success: boolean;
  }
}

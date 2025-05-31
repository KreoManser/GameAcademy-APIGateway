// shared/contracts/src/lib/account/user.search.ts
import { IsOptional, IsString } from 'class-validator';

export namespace UserSearch {
  export const topic = 'users.search.query';

  export class Request {
    @IsOptional()
    @IsString()
    query?: string;
  }

  export class Response {
    users: Array<{
      _id: string;
      email: string;
      displayName?: string;
      role: string;
    }>;
  }
}

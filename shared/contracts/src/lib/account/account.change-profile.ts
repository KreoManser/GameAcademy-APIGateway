import { Type } from 'class-transformer';
import { ValidateNested, IsString } from 'class-validator';

class ChangeProfileDto {
  @IsString()
  displayName: string;
}

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command';

  export class Request {
    @IsString()
    id: string;

    @ValidateNested()
    @Type(() => ChangeProfileDto)
    user: ChangeProfileDto; // now this is a real class
  }

  export class Response {}
}

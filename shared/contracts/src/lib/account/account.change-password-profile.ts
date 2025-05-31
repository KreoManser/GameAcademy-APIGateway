import { IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Старый пароль должен содержать минимум 6 символов' })
  oldPassword: string;

  @IsString()
  @MinLength(6, { message: 'Новый пароль должен содержать минимум 6 символов' })
  newPassword: string;
}

export namespace AccountChangePasswordProfile {
  export const topic = 'account.change-password-profile.command';

  export class Request {
    @IsString()
    id: string;

    @Type(() => ChangePasswordDto)
    @ValidateNested()
    passwords: ChangePasswordDto;
  }

  export class Response {
    success: boolean;
  }
}

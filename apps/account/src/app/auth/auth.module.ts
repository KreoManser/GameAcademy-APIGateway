import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from '../configs/jwt.config';
import { UserModule } from '../user/user.module';
import { AuthContoller } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, JwtModule.registerAsync(getJwtConfig())],
  controllers: [AuthContoller],
  providers: [AuthService],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RMQModule } from 'nestjs-rmq';
import { getJwtConfig } from './configs/jwt.config';
import { getRMQConfig } from './configs/rmq.config';
import { AuthContoller } from './controllers/auth.controller';
// import { ProjectController } from './controllers/project.controller';
import { UserContoller } from './controllers/user.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.api.env', isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJwtConfig()),
    PassportModule,
  ],
  controllers: [
    AuthContoller,
    UserContoller,
    // ProjectController
  ],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AppModule {}

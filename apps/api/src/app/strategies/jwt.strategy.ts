import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IJWTPayload } from '@shared/interfaces';
import { ExtractJwt, Strategy } from 'passport-jwt';

// auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // Вместо возвращать строку — возвращаем объект
  async validate(payload: IJWTPayload) {
    // payload.id — ваше userId
    // возвращаем весь пэйлоуд, чтобы в req.user были и другие поля, если они понадобятся
    return payload;
    // либо, если вы хотите строго { sub: string }:
    // return { sub: payload.id };
  }
}

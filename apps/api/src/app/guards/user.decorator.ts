// src/guards/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  if (typeof user === 'string') {
    // если strategy уже вернул строку
    return user;
  }

  // Если в user лежит JWT‑payload
  if (user && typeof user === 'object') {
    // сначала пробуем sub
    if (typeof user.sub === 'string') {
      return user.sub;
    }
    // иначе пробуем поле id
    if (typeof user.id === 'string') {
      return user.id;
    }
  }

  throw new Error('Cannot extract userId from request');
});

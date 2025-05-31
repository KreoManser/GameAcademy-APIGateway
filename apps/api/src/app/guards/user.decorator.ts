import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  if (typeof user === 'string') {
    return user;
  }

  if (user && typeof user === 'object') {
    if (typeof user.sub === 'string') {
      return user.sub;
    }
    if (typeof user.id === 'string') {
      return user.id;
    }
  }

  throw new Error('Cannot extract userId from request');
});

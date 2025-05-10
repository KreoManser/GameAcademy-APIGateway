// src/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', ctx.getHandler());
    if (!requiredRoles) return true;
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as any;
    return requiredRoles.includes((user as any).role);
  }
}

// декоратор
import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { defineAbilityFor, Actions, Subjects } from './ability.factory';
import { ABILITY_KEY } from './require-ability.decorator';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirement = this.reflector.getAllAndOverride<[Actions, Subjects]>(
      ABILITY_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requirement) return true;
    const [action, subject] = requirement;
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    const ability = defineAbilityFor(user.permissions ?? [], user.role);
    return ability.can(action, subject);
  }
}

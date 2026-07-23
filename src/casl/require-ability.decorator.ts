import { SetMetadata } from '@nestjs/common';
import { Actions, Subjects } from './ability.factory';

export const ABILITY_KEY = 'ability';
export const RequireAbility = (action: Actions, subject: Subjects) =>
  SetMetadata(ABILITY_KEY, [action, subject]);

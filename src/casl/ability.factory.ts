import { AbilityBuilder, Ability } from '@casl/ability';

export type Subjects = 'User' | 'all';
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';

export function defineAbilityFor(role: string) {
  const { can, cannot, build } = new AbilityBuilder<Ability<[Actions, Subjects]>>(Ability);
  switch (role) {
    case 'admin':
      can('manage', 'all');
      break;
    case 'recruiter':
      can('read', 'User');
      can('create', 'User');
      can('update', 'User');
      cannot('delete', 'User');
      break;
    case 'candidate':
      can('read', 'User');
      can('update', 'User');
      cannot('create', 'User');
      cannot('delete', 'User');
      break;
    default:
      can('read', 'User');
  }
  return build();
}

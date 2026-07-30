import { AbilityBuilder, Ability } from '@casl/ability';

export type Subjects =
  | 'User'
  | 'Employee'
  | 'EmployeeStatus'
  | 'Department'
  | 'CompanySettings'
  | 'Role'
  | 'Catalog'
  | 'all';
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';

export function defineAbilityFor(permissions: string[], role?: string) {
  const { can, cannot, build } = new AbilityBuilder<
    Ability<[Actions, Subjects]>
  >(Ability);

  if (role === 'admin' || permissions.includes('*')) {
    can('manage', 'all');
    return build();
  }

  const subjectMap: Record<string, Subjects> = {
    employee: 'Employee',
    'employee-status': 'EmployeeStatus',
    department: 'Department',
    user: 'User',
    'company-settings': 'CompanySettings',
    catalog: 'Catalog',
    role: 'Role',
  };

  for (const perm of permissions) {
    const [rawSubject, action] = perm.split(':');
    const subject = subjectMap[rawSubject];
    if (subject && action) {
      can(action as Actions, subject);
    }
  }

  return build();
}

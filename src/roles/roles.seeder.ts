import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';

const ALL_PERMISSIONS: { name: string; group: string; description: string }[] = [
  { name: 'employee:create', group: 'employees', description: 'Create employees' },
  { name: 'employee:read', group: 'employees', description: 'View employees' },
  { name: 'employee:update', group: 'employees', description: 'Edit employees' },
  { name: 'employee:delete', group: 'employees', description: 'Delete employees' },
  { name: 'employee-status:create', group: 'employee-statuses', description: 'Create employee statuses' },
  { name: 'employee-status:read', group: 'employee-statuses', description: 'View employee statuses' },
  { name: 'employee-status:update', group: 'employee-statuses', description: 'Edit employee statuses' },
  { name: 'employee-status:delete', group: 'employee-statuses', description: 'Delete employee statuses' },
  { name: 'department:create', group: 'departments', description: 'Create departments' },
  { name: 'department:read', group: 'departments', description: 'View departments' },
  { name: 'department:update', group: 'departments', description: 'Edit departments' },
  { name: 'department:delete', group: 'departments', description: 'Delete departments' },
  { name: 'user:create', group: 'users', description: 'Create users' },
  { name: 'user:read', group: 'users', description: 'View users' },
  { name: 'user:update', group: 'users', description: 'Edit users' },
  { name: 'user:delete', group: 'users', description: 'Delete users' },
  { name: 'company-settings:read', group: 'company-settings', description: 'View company settings' },
  { name: 'company-settings:update', group: 'company-settings', description: 'Edit company settings' },
  { name: 'catalog:create', group: 'catalogs', description: 'Create catalog entries' },
  { name: 'catalog:read', group: 'catalogs', description: 'View catalog entries' },
  { name: 'catalog:update', group: 'catalogs', description: 'Edit catalog entries' },
  { name: 'catalog:delete', group: 'catalogs', description: 'Delete catalog entries' },
  { name: 'role:create', group: 'roles', description: 'Create roles' },
  { name: 'role:read', group: 'roles', description: 'View roles' },
  { name: 'role:update', group: 'roles', description: 'Edit roles' },
  { name: 'role:delete', group: 'roles', description: 'Delete roles' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.name),
  supervisor: [
    'employee:create', 'employee:read', 'employee:update',
    'employee-status:read',
    'department:read',
    'user:create', 'user:read', 'user:update',
    'company-settings:read',
    'role:read',
  ],
  monitor: [
    'employee:read',
    'employee-status:read',
    'department:read',
    'user:read', 'user:update',
  ],
};

@Injectable()
export class RolesSeeder implements OnModuleInit {
  private readonly logger = new Logger(RolesSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepo: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
  }

  private async seedPermissions() {
    const existing = await this.permissionsRepo.find();
    const existingNames = new Set(existing.map((p) => p.name));
    const missing = ALL_PERMISSIONS.filter((p) => !existingNames.has(p.name));
    if (missing.length === 0) {
      this.logger.log('All permissions already exist');
      return;
    }
    await this.permissionsRepo.save(
      missing.map((p) => this.permissionsRepo.create(p)),
    );
    this.logger.log(`Added ${missing.length} missing permissions`);
  }

  private async seedRoles() {
    const allPerms = await this.permissionsRepo.find();
    const permByName = new Map(allPerms.map((p) => [p.name, p]));

    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      let role = await this.rolesRepo.findOne({
        where: { name: roleName },
        relations: { permissions: true },
      });

      const expectedPerms = permNames
        .map((n) => permByName.get(n))
        .filter((p): p is Permission => !!p);

      if (role) {
        role.permissions = expectedPerms;
        await this.rolesRepo.save(role);
        this.logger.log(
          `Synced role: ${roleName} (${expectedPerms.length} permissions)`,
        );
      } else {
        role = this.rolesRepo.create({
          name: roleName,
          description:
            roleName === 'admin'
              ? 'Full access'
              : roleName === 'supervisor'
                ? 'Management access'
                : 'Read-only access',
          isSystem: roleName === 'admin',
          permissions: expectedPerms,
        });
        await this.rolesRepo.save(role);
        this.logger.log(
          `Seeded role: ${roleName} (${expectedPerms.length} permissions)`,
        );
      }
    }
  }
}

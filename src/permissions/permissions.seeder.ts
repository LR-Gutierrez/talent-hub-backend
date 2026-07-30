import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

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
];

@Injectable()
export class PermissionsSeeder implements OnModuleInit {
  private readonly logger = new Logger(PermissionsSeeder.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepo: Repository<Permission>,
  ) {}

  async onModuleInit() {
    const count = await this.permissionsRepo.count();
    if (count > 0) return;

    await this.permissionsRepo.save(
      ALL_PERMISSIONS.map((p) => this.permissionsRepo.create(p)),
    );
    this.logger.log(`Seeded ${ALL_PERMISSIONS.length} permissions`);
  }
}

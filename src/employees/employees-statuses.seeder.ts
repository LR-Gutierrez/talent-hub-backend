import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeStatus } from './entities/employee-status.entity';

@Injectable()
export class EmployeeStatusesSeeder implements OnModuleInit {
  private readonly logger = new Logger(EmployeeStatusesSeeder.name);

  constructor(
    @InjectRepository(EmployeeStatus)
    private readonly statusRepo: Repository<EmployeeStatus>,
  ) {}

  async onModuleInit() {
    const count = await this.statusRepo.count();
    if (count > 0) return;

    const statuses = [
      {
        name: 'Active',
        description: 'Currently employed',
        color: '#22c55e',
        isActive: true,
      },
      {
        name: 'Inactive',
        description: 'No longer employed',
        color: '#ef4444',
        isActive: true,
      },
      {
        name: 'On Leave',
        description: 'Temporarily away',
        color: '#f59e0b',
        isActive: true,
      },
      {
        name: 'Probation',
        description: 'Under probation period',
        color: '#3b82f6',
        isActive: true,
      },
    ];

    await this.statusRepo.save(statuses.map((s) => this.statusRepo.create(s)));
    this.logger.log(`Seeded ${statuses.length} employee statuses`);
  }
}

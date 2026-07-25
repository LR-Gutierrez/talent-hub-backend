import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersSeeder implements OnModuleInit {
  private readonly logger = new Logger(UsersSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const count = await this.usersRepo.count();
    if (count > 0) return;

    const user = this.usersRepo.create({
      email: 'admin@local.com',
      password: '123Qwe',
      displayName: 'Admin',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await this.usersRepo.save(user);
    this.logger.log('Default admin user created: admin@local.com / 123Qwe');
  }
}

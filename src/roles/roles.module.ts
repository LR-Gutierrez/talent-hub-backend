import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesSeeder } from './roles.seeder';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission]), CaslModule],
  controllers: [RolesController],
  providers: [RolesService, RolesSeeder],
  exports: [RolesService, RolesSeeder],
})
export class RolesModule {}

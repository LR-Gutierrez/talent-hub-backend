import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { CompanySettingsModule } from './company-settings/company-settings.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { HealthModule } from './health/health.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_USERNAME: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().default('123456'),
        DB_DATABASE: Joi.string().default('talent_hub'),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
        CORS_ORIGIN: Joi.string().default(
          'http://localhost:5173,http://localhost:3000',
        ),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '123456',
        database: process.env.DB_DATABASE ?? 'talent_hub',
        autoLoadEntities: true,
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
      }),
    }),
    PermissionsModule,
    RolesModule,
    UsersModule,
    AuthModule,
    CaslModule,
    EmployeesModule,
    DepartmentsModule,
    CompanySettingsModule,
    CatalogsModule,
    HealthModule,
  ],
})
export class AppModule {}

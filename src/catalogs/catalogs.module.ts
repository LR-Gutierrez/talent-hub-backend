import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gender } from './entities/gender.entity';
import { MaritalStatus } from './entities/marital-status.entity';
import { EducationLevel } from './entities/education-level.entity';
import { EmployeeDegree } from './entities/employee-degree.entity';
import { UniformSize } from './entities/uniform-size.entity';
import { Country } from './entities/country.entity';
import {
  GendersController,
  MaritalStatusesController,
  EducationLevelsController,
  EmployeeDegreesController,
  UniformSizesController,
  CountriesController,
} from './catalogs.controller';
import { CatalogsSeeder } from './catalogs.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Gender,
      MaritalStatus,
      EducationLevel,
      EmployeeDegree,
      UniformSize,
      Country,
    ]),
  ],
  controllers: [
    GendersController,
    MaritalStatusesController,
    EducationLevelsController,
    EmployeeDegreesController,
    UniformSizesController,
    CountriesController,
  ],
  providers: [CatalogsSeeder],
})
export class CatalogsModule {}

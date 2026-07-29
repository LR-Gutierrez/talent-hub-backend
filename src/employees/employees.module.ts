import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeStatusesController } from './employee-statuses.controller';
import { EmployeesImportExportService } from './employees-import-export.service';
import { EmployeesImportExportController } from './employees-import-export.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { EmployeeEducation } from './entities/employee-education.entity';
import { EmployeeUniform } from './entities/employee-uniform.entity';
import { EmployeeChild } from './entities/employee-child.entity';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';
import { Department } from '../departments/entities/department.entity';
import { Gender } from '../catalogs/entities/gender.entity';
import { Country } from '../catalogs/entities/country.entity';
import { MaritalStatus } from '../catalogs/entities/marital-status.entity';
import { BloodType } from '../catalogs/entities/blood-type.entity';
import { EmployeeStatusesSeeder } from './employees-statuses.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      EmployeeStatus,
      EmployeeHistory,
      EmployeeEducation,
      EmployeeUniform,
      EmployeeChild,
      EmployeeEmergencyContact,
      Department,
      Gender,
      Country,
      MaritalStatus,
      BloodType,
    ]),
  ],
  controllers: [
    EmployeesController,
    EmployeeStatusesController,
    EmployeesImportExportController,
  ],
  providers: [
    EmployeesService,
    EmployeesImportExportService,
    EmployeeStatusesSeeder,
  ],
  exports: [EmployeesService],
})
export class EmployeesModule {}

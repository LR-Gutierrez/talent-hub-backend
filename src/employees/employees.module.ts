import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeStatusesController } from './employee-statuses.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { EmployeeEducation } from './entities/employee-education.entity';
import { EmployeeUniform } from './entities/employee-uniform.entity';
import { EmployeeChild } from './entities/employee-child.entity';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';
import { Department } from '../departments/entities/department.entity';
import { Gender } from '../catalogs/entities/gender.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeStatus, EmployeeHistory, EmployeeEducation, EmployeeUniform, EmployeeChild, EmployeeEmergencyContact, Department, Gender])],
  controllers: [EmployeesController, EmployeeStatusesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

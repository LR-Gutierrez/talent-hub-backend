import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeStatusesController } from './employee-statuses.controller';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeStatus, EmployeeHistory])],
  controllers: [EmployeesController, EmployeeStatusesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeHistory } from '../employees/entities/employee-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Employee, EmployeeHistory])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}

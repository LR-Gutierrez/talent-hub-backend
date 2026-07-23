import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangeEmployeeStatusDto } from './dto/change-employee-status.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeStatus)
    private readonly statusRepository: Repository<EmployeeStatus>,
    @InjectRepository(EmployeeHistory)
    private readonly historyRepository: Repository<EmployeeHistory>,
  ) {}

  async findAll(params: {
    pageIndex: number;
    pageSize: number;
    query: string;
    sortKey?: string;
    sortOrder?: string;
    statusId?: string;
    departmentId?: string;
  }) {
    const { pageIndex, pageSize, query, sortKey, sortOrder, statusId, departmentId } = params;
    const where: FindOptionsWhere<Employee> = {};
    if (query) {
      where.fullName = ILike(`%${query}%`);
    }
    if (statusId) where.statusId = statusId;
    if (departmentId) where.departmentId = departmentId;
    const order: any = sortKey && sortOrder ? { [sortKey]: sortOrder } : { fullName: 'ASC' };
    const [list, total] = await this.employeeRepository.findAndCount({
      where,
      order,
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      relations: { status: true, supervisor: true, department: true },
    });
    return { list, total };
  }

  async findOne(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: { status: true, supervisor: true, department: true },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async create(dto: CreateEmployeeDto, changedBy?: string) {
    const status = await this.statusRepository.findOneBy({ id: dto.statusId });
    if (!status) throw new NotFoundException('EmployeeStatus not found');

    const employee = this.employeeRepository.create(dto);
    const saved = await this.employeeRepository.save(employee);

    await this.historyRepository.save({
      employee: { id: saved.id } as any,
      changedField: 'status',
      oldValue: null,
      newValue: status.name,
      changedBy: changedBy ?? null,
      notes: 'Employee created',
    } as any);

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateEmployeeDto, changedBy?: string) {
    const employee = await this.findOne(id);
    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined && (employee as any)[key] !== value) {
        changes.push({
          field: key,
          oldValue: String((employee as any)[key] ?? ''),
          newValue: String(value ?? ''),
        });
      }
    }

    Object.assign(employee, dto);
    const saved = await this.employeeRepository.save(employee);

    for (const change of changes) {
      await this.historyRepository.save({
        employee: { id: saved.id } as any,
        changedField: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changedBy: changedBy ?? null,
      } as any);
    }

    return this.findOne(saved.id);
  }

  async changeStatus(id: string, dto: ChangeEmployeeStatusDto, changedBy?: string) {
    const employee = await this.findOne(id);
    const newStatus = await this.statusRepository.findOneBy({ id: dto.statusId });
    if (!newStatus) throw new NotFoundException('EmployeeStatus not found');

    const oldStatusName = employee.status?.name ?? 'None';
    employee.statusId = dto.statusId;
    await this.employeeRepository.save(employee);

    await this.historyRepository.save({
      employee: { id: employee.id } as any,
      changedField: 'status',
      oldValue: oldStatusName,
      newValue: newStatus.name,
      changedBy: changedBy ?? null,
      notes: dto.notes ?? null,
    } as any);

    return this.findOne(employee.id);
  }

  async getHistory(employeeId: string) {
    return this.historyRepository.find({
      where: { employee: { id: employeeId } },
      order: { changedAt: 'DESC' },
    });
  }

  async remove(id: string) {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

}

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeHistory } from '../employees/entities/employee-history.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeHistory)
    private readonly historyRepository: Repository<EmployeeHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(params: { pageIndex: number; pageSize: number; query?: string; withDeleted?: boolean }) {
    const { pageIndex, pageSize, query, withDeleted } = params;
    const skip = (pageIndex - 1) * pageSize;
    const where = query ? { name: ILike(`%${query}%`) } : {};
    const [list, total] = await this.departmentRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: pageSize,
      withDeleted,
    });
    return { list, total, pageIndex, pageSize };
  }

  async findOne(id: string, withDeleted = false) {
    const dept = await this.departmentRepository.findOne({ where: { id }, withDeleted });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    await this.ensureUniqueName(dto.name);
    const dept = this.departmentRepository.create(dto);
    return this.departmentRepository.save(dept);
  }

  private async ensureUniqueName(name: string, excludeId?: string, manager?: any) {
    const repo = manager ? manager.getRepository(Department) : this.departmentRepository;
    const existing = await repo.findOne({
      where: { name: ILike(name.trim()) },
      withDeleted: true,
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(`A department with the name "${name.trim()}" already exists.`);
    }
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dept = await this.findOne(id);
    Object.assign(dept, dto);
    return this.departmentRepository.save(dept);
  }

  async getEmployeeCount(id: string) {
    await this.findOne(id);
    return this.employeeRepository.count({ where: { departmentId: id } });
  }

  async remove(id: string, changedBy?: string, force?: boolean, targetDepartmentId?: string, newDepartmentName?: string) {
    const origDept = await this.findOne(id);
    const employeeCount = await this.employeeRepository.count({ where: { departmentId: id } });

    if (employeeCount > 0 && !force) {
      throw new ConflictException({
        message: `Cannot delete department "${origDept.name}" because ${employeeCount} employee(s) are assigned to it. Reassign them first.`,
        employeeCount,
        departmentName: origDept.name,
      });
    }

    if (employeeCount === 0) {
      await this.departmentRepository.softRemove(origDept);
      return { success: true };
    }

    return this.dataSource.transaction(async (manager) => {
      const dept = await manager.findOne(Department, { where: { id } });
      if (!dept) throw new NotFoundException('Department not found');

      let actualTargetId: string;
      let targetDeptName: string;

      if (newDepartmentName) {
        const trimmedName = newDepartmentName.trim();
        await this.ensureUniqueName(trimmedName, undefined, manager);
        const created = manager.create(Department, { name: trimmedName, isActive: true });
        const saved = await manager.save(Department, created);
        actualTargetId = saved.id;
        targetDeptName = saved.name;
      } else {
        const targetDept = await manager.findOne(Department, { where: { id: targetDepartmentId } });
        if (!targetDept) throw new NotFoundException('Target department not found');
        if (targetDept.id === id) throw new BadRequestException('Cannot reassign employees to the same department');
        actualTargetId = targetDepartmentId!;
        targetDeptName = targetDept.name;
      }

      const employees = await manager.find(Employee, { where: { departmentId: id } });
      for (const employee of employees) {
        employee.departmentId = actualTargetId;
        await manager.save(Employee, employee);

        const history = manager.create(EmployeeHistory, {
          employee: { id: employee.id } as any,
          changedField: 'department',
          oldValue: dept.name,
          newValue: targetDeptName,
          changedBy: changedBy ?? null,
          notes: `Reassigned due to deletion of department "${dept.name}"`,
        } as any);
        await manager.save(EmployeeHistory, history);
      }

      await manager.softRemove(dept);

      return { movedCount: employeeCount, targetDepartmentName: targetDeptName };
    });
  }

  async restore(id: string) {
    const dept = await this.departmentRepository.findOne({ where: { id }, withDeleted: true });
    if (!dept) throw new NotFoundException('Department not found');
    return this.departmentRepository.restore(dept.id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { EmployeeEducation } from './entities/employee-education.entity';
import { EmployeeUniform } from './entities/employee-uniform.entity';
import { EmployeeChild } from './entities/employee-child.entity';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';
import { Department } from '../departments/entities/department.entity';
import { Gender } from '../catalogs/entities/gender.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangeEmployeeStatusDto } from './dto/change-employee-status.dto';
import { BulkChangeEmployeeStatusDto } from './dto/bulk-change-employee-status.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeStatus)
    private readonly statusRepository: Repository<EmployeeStatus>,
    @InjectRepository(EmployeeHistory)
    private readonly historyRepository: Repository<EmployeeHistory>,
    @InjectRepository(EmployeeEducation)
    private readonly educationRepository: Repository<EmployeeEducation>,
    @InjectRepository(EmployeeUniform)
    private readonly uniformRepository: Repository<EmployeeUniform>,
    @InjectRepository(EmployeeChild)
    private readonly childRepository: Repository<EmployeeChild>,
    @InjectRepository(EmployeeEmergencyContact)
    private readonly emergencyContactRepository: Repository<EmployeeEmergencyContact>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Gender)
    private readonly genderRepository: Repository<Gender>,
  ) {}

  async findAll(params: {
    pageIndex: number;
    pageSize: number;
    query: string;
    sortKey?: string;
    sortOrder?: string;
    statusId?: string;
    departmentId?: string;
    withDeleted?: boolean;
  }) {
    const { pageIndex, pageSize, query, sortKey, sortOrder, statusId, departmentId, withDeleted } = params;
    const where: FindOptionsWhere<Employee> = {};
    if (query) {
      where.fullName = ILike(`%${query}%`);
    }
    if (statusId) where.statusId = statusId;
    if (departmentId) where.departmentId = departmentId;
    let order: any = { fullName: 'ASC' };
    if (sortKey && sortOrder) {
      if (sortKey === 'department') {
        order = { department: { name: sortOrder } };
      } else if (sortKey === 'status') {
        order = { status: { name: sortOrder } };
      } else if (sortKey === 'supervisor') {
        order = { supervisor: { fullName: sortOrder } };
      } else {
        order = { [sortKey]: sortOrder };
      }
    }
    const [list, total] = await this.employeeRepository.findAndCount({
      where,
      order,
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      withDeleted,
      relations: {
        status: true,
        supervisor: true,
        department: true,
        nationalityRef: true,
        placeOfBirthRef: true,
        maritalStatusRef: true,
        genderRef: true,
      },
    });
    return { list, total };
  }

  async findOne(id: string, withDeleted = false) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      withDeleted,
      relations: {
        status: true,
        supervisor: true,
        department: true,
        educations: true,
        uniforms: true,
        children: true,
        emergencyContacts: true,
        nationalityRef: true,
        placeOfBirthRef: true,
        maritalStatusRef: true,
        genderRef: true,
        bloodTypeRef: true,
      },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async create(dto: CreateEmployeeDto, changedBy?: string) {
    const status = await this.statusRepository.findOneBy({ id: dto.statusId });
    if (!status) throw new NotFoundException('EmployeeStatus not found');

    const { children, emergencyContacts, ...employeeData } = dto;

    const employee = this.employeeRepository.create(employeeData);
    const saved = await this.employeeRepository.save(employee);

    if (children?.length) {
      const childEntities = children.map((c) =>
        this.childRepository.create({ ...c, employeeId: saved.id }),
      );
      await this.childRepository.save(childEntities);
    }

    if (emergencyContacts?.length) {
      const contactEntities = emergencyContacts.map((c) =>
        this.emergencyContactRepository.create({ ...c, employeeId: saved.id }),
      );
      await this.emergencyContactRepository.save(contactEntities);
    }

    await this.educationRepository.save(
      this.educationRepository.create({
        employeeId: saved.id,
        educationLevel: dto.educationLevel,
        degree: dto.degree,
        institution: dto.institution,
        graduationYear: dto.graduationYear,
      }),
    );

    await this.uniformRepository.save(
      this.uniformRepository.create({
        employeeId: saved.id,
        shirtSize: dto.shirtSize,
        pantSize: dto.pantSize,
        shoeSize: dto.shoeSize,
        jacketSize: dto.jacketSize,
        helmetSize: dto.helmetSize,
      }),
    );

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

    const { children, emergencyContacts, ...employeeData } = dto;

    for (const [key, value] of Object.entries(employeeData)) {
      if (value !== undefined && (employee as any)[key] !== value) {
        changes.push({
          field: key,
          oldValue: String((employee as any)[key] ?? ''),
          newValue: String(value ?? ''),
        });
      }
    }

    Object.assign(employee, employeeData);
    const saved = await this.employeeRepository.save(employee);

    if (dto.educationLevel !== undefined || dto.degree !== undefined || dto.institution !== undefined || dto.graduationYear !== undefined) {
      const existingEducation = await this.educationRepository.findOneBy({ employeeId: id });
      if (existingEducation) {
        Object.assign(existingEducation, {
          educationLevel: dto.educationLevel,
          degree: dto.degree,
          institution: dto.institution,
          graduationYear: dto.graduationYear,
        });
        await this.educationRepository.save(existingEducation);
      } else {
        await this.educationRepository.save(
          this.educationRepository.create({
            employeeId: id,
            educationLevel: dto.educationLevel,
            degree: dto.degree,
            institution: dto.institution,
            graduationYear: dto.graduationYear,
          }),
        );
      }
    }

    if (dto.shirtSize !== undefined || dto.pantSize !== undefined || dto.shoeSize !== undefined || dto.jacketSize !== undefined || dto.helmetSize !== undefined) {
      const existingUniform = await this.uniformRepository.findOneBy({ employeeId: id });
      if (existingUniform) {
        Object.assign(existingUniform, {
          shirtSize: dto.shirtSize,
          pantSize: dto.pantSize,
          shoeSize: dto.shoeSize,
          jacketSize: dto.jacketSize,
          helmetSize: dto.helmetSize,
        });
        await this.uniformRepository.save(existingUniform);
      } else {
        await this.uniformRepository.save(
          this.uniformRepository.create({
            employeeId: id,
            shirtSize: dto.shirtSize,
            pantSize: dto.pantSize,
            shoeSize: dto.shoeSize,
            jacketSize: dto.jacketSize,
            helmetSize: dto.helmetSize,
          }),
        );
      }
    }

    if (children !== undefined) {
      await this.childRepository.delete({ employeeId: id });
      if (children.length) {
        const childEntities = children.map((c) =>
          this.childRepository.create({ ...c, employeeId: id }),
        );
        await this.childRepository.save(childEntities);
      }
    }

    if (emergencyContacts !== undefined) {
      await this.emergencyContactRepository.delete({ employeeId: id });
      if (emergencyContacts.length) {
        const contactEntities = emergencyContacts.map((c) =>
          this.emergencyContactRepository.create({ ...c, employeeId: id }),
        );
        await this.emergencyContactRepository.save(contactEntities);
      }
    }

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
    employee.status = newStatus;
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

  async bulkChangeStatus(dto: BulkChangeEmployeeStatusDto, changedBy?: string) {
    const newStatus = await this.statusRepository.findOneBy({ id: dto.statusId });
    if (!newStatus) throw new NotFoundException('EmployeeStatus not found');

    let changed = 0;
    for (const employeeId of dto.employeeIds) {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: { status: true },
      });
      if (!employee) continue;

      const oldStatusName = employee.status?.name ?? 'None';
      employee.status = newStatus;
      await this.employeeRepository.save(employee);

      await this.historyRepository.save({
        employee: { id: employee.id } as any,
        changedField: 'status',
        oldValue: oldStatusName,
        newValue: newStatus.name,
        changedBy: changedBy ?? null,
        notes: dto.notes ?? 'Bulk status change',
      } as any);

      changed++;
    }

    return { changed };
  }

  async getHistory(employeeId: string) {
    return this.historyRepository.find({
      where: { employee: { id: employeeId } },
      order: { changedAt: 'DESC' },
    });
  }

  async updatePhotoUrl(id: string, photoUrl: string) {
    await this.employeeRepository.update(id, { photoUrl });
  }

  async remove(id: string) {
    const employee = await this.findOne(id);
    await this.employeeRepository.softRemove(employee);
  }

  async restore(id: string) {
    const employee = await this.employeeRepository.findOne({ where: { id }, withDeleted: true, relations: { educations: true, uniforms: true, children: true, emergencyContacts: true } });
    if (!employee) throw new NotFoundException('Employee not found');
    return this.employeeRepository.recover(employee);
  }

  async getStats() {
    const totalEmployees = await this.employeeRepository.count();
    const totalDepartments = await this.departmentRepository.count({ where: { isActive: true } });
    const totalStatuses = await this.statusRepository.count();
    const totalGenders = await this.genderRepository.count();

    const rawByStatus = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('employee.statusId', 'statusId')
      .addSelect('status.name', 'statusName')
      .addSelect('status.color', 'color')
      .addSelect('COUNT(employee.id)', 'count')
      .innerJoin('employee.status', 'status')
      .groupBy('employee.statusId')
      .addGroupBy('status.name')
      .addGroupBy('status.color')
      .orderBy('count', 'DESC')
      .getRawMany();
    const employeesByStatus = rawByStatus.map((r) => ({ ...r, count: Number(r.count) }));

    const rawByDepartment = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('employee.departmentId', 'departmentId')
      .addSelect('COALESCE(department.name, \'Unassigned\')', 'departmentName')
      .addSelect('COUNT(employee.id)', 'count')
      .leftJoin('employee.department', 'department')
      .groupBy('employee.departmentId')
      .addGroupBy('department.name')
      .orderBy('count', 'DESC')
      .getRawMany();
    const employeesByDepartment = rawByDepartment.map((r) => ({ ...r, count: Number(r.count) }));

    const rawByGender = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('employee.genderId', 'genderId')
      .addSelect('COALESCE(gender.name, \'Unassigned\')', 'genderName')
      .addSelect('COUNT(employee.id)', 'count')
      .leftJoin('employee.genderRef', 'gender')
      .groupBy('employee.genderId')
      .addGroupBy('gender.name')
      .orderBy('count', 'DESC')
      .getRawMany();
    const employeesByGender = rawByGender.map((r) => ({ ...r, count: Number(r.count) }));

    const recentEmployees = await this.employeeRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: { status: true, department: true },
    });

    return { totalEmployees, totalDepartments, totalStatuses, totalGenders, employeesByStatus, employeesByDepartment, employeesByGender, recentEmployees };
  }
}

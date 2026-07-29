import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { EmployeeStatus } from './entities/employee-status.entity';
import { Employee } from './entities/employee.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { CreateEmployeeStatusDto } from './dto/create-employee-status.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

@Controller('employee-statuses')
export class EmployeeStatusesController {
  constructor(
    @InjectRepository(EmployeeStatus)
    private readonly statusRepository: Repository<EmployeeStatus>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeHistory)
    private readonly historyRepository: Repository<EmployeeHistory>,
    private readonly dataSource: DataSource,
  ) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post()
  @RequireAbility('create', 'EmployeeStatus')
  async create(@Body() dto: CreateEmployeeStatusDto) {
    await this.ensureUniqueName(dto.name);
    const status = this.statusRepository.create(dto);
    return this.statusRepository.save(status);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'EmployeeStatus')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('withDeleted') withDeleted?: string,
  ) {
    const take = pageSize ? parseInt(pageSize, 10) : 100;
    const skip = ((pageIndex ? parseInt(pageIndex, 10) : 1) - 1) * take;
    const where = query ? { name: ILike(`%${query}%`) } : {};
    const [list, total] = await this.statusRepository.findAndCount({
      order: { name: 'ASC' },
      take,
      skip,
      where,
      withDeleted: withDeleted === 'true',
    });
    return {
      list,
      total,
      pageIndex: pageIndex ? parseInt(pageIndex, 10) : 1,
      pageSize: take,
    };
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id')
  @RequireAbility('read', 'EmployeeStatus')
  async findOne(
    @Param('id') id: string,
    @Query('withDeleted') withDeleted?: string,
  ) {
    const status = await this.statusRepository.findOne({
      where: { id },
      withDeleted: withDeleted === 'true',
    });
    if (!status) throw new NotFoundException('EmployeeStatus not found');
    return status;
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id/employee-count')
  @RequireAbility('read', 'EmployeeStatus')
  async getEmployeeCount(@Param('id') id: string) {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) throw new NotFoundException('EmployeeStatus not found');
    const count = await this.employeeRepository.count({
      where: { statusId: id },
    });
    return { employeeCount: count };
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id')
  @RequireAbility('update', 'EmployeeStatus')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeStatusDto) {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) throw new NotFoundException('EmployeeStatus not found');
    Object.assign(status, dto);
    return this.statusRepository.save(status);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Delete(':id')
  @RequireAbility('delete', 'EmployeeStatus')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Query('force') force?: string,
    @Query('targetStatusId') targetStatusId?: string,
    @Query('newStatusName') newStatusName?: string,
  ) {
    const origStatus = await this.statusRepository.findOneBy({ id });
    if (!origStatus) throw new NotFoundException('EmployeeStatus not found');

    const employeeCount = await this.employeeRepository.count({
      where: { statusId: id },
    });

    if (employeeCount > 0 && !force) {
      throw new ConflictException({
        message: `Cannot delete status "${origStatus.name}" because ${employeeCount} employee(s) are assigned to it. Reassign them first.`,
        employeeCount,
        statusName: origStatus.name,
      });
    }

    if (employeeCount === 0) {
      await this.statusRepository.softRemove(origStatus);
      return { success: true };
    }

    return this.dataSource.transaction(async (manager) => {
      const status = await manager.findOne(EmployeeStatus, { where: { id } });
      if (!status) throw new NotFoundException('EmployeeStatus not found');

      let actualTargetId: string;
      let targetStatusName: string;

      if (newStatusName) {
        const trimmedName = newStatusName.trim();
        const existing = await manager.findOne(EmployeeStatus, {
          where: { name: ILike(trimmedName) },
          withDeleted: true,
        });
        if (existing)
          throw new BadRequestException(
            `A status with the name "${trimmedName}" already exists.`,
          );
        const created = manager.create(EmployeeStatus, {
          name: trimmedName,
          isActive: true,
        });
        const saved = await manager.save(EmployeeStatus, created);
        actualTargetId = saved.id;
        targetStatusName = saved.name;
      } else {
        const targetStatus = await manager.findOne(EmployeeStatus, {
          where: { id: targetStatusId },
        });
        if (!targetStatus)
          throw new NotFoundException('Target status not found');
        if (targetStatus.id === id)
          throw new BadRequestException(
            'Cannot reassign employees to the same status',
          );
        actualTargetId = targetStatusId!;
        targetStatusName = targetStatus.name;
      }

      const employees = await manager.find(Employee, {
        where: { statusId: id },
      });
      for (const employee of employees) {
        employee.statusId = actualTargetId;
        await manager.save(Employee, employee);

        const history = manager.create(EmployeeHistory, {
          employee: { id: employee.id } as any,
          changedField: 'status',
          oldValue: status.name,
          newValue: targetStatusName,
          changedBy: req.user?.email ?? null,
          notes: `Reassigned due to deletion of status "${status.name}"`,
        } as any);
        await manager.save(EmployeeHistory, history);
      }

      await manager.softRemove(status);

      return { movedCount: employeeCount, targetStatusName };
    });
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id/restore')
  @RequireAbility('update', 'EmployeeStatus')
  async restore(@Param('id') id: string) {
    const status = await this.statusRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!status) throw new NotFoundException('EmployeeStatus not found');
    return this.statusRepository.restore(status.id);
  }

  private async ensureUniqueName(name: string, excludeId?: string) {
    const existing = await this.statusRepository.findOne({
      where: { name: ILike(name.trim()) },
      withDeleted: true,
    });
    if (existing && existing.id !== excludeId) {
      throw new BadRequestException(
        `A status with the name "${name.trim()}" already exists.`,
      );
    }
  }
}

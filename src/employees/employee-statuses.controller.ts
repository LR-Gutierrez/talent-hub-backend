import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeStatus } from './entities/employee-status.entity';
import { CreateEmployeeStatusDto } from './dto/create-employee-status.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';
import { NotFoundException } from '@nestjs/common';

@Controller('employee-statuses')
export class EmployeeStatusesController {
  constructor(
    @InjectRepository(EmployeeStatus)
    private readonly statusRepository: Repository<EmployeeStatus>,
  ) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post()
  @RequireAbility('create', 'EmployeeStatus')
  create(@Body() dto: CreateEmployeeStatusDto) {
    const status = this.statusRepository.create(dto);
    return this.statusRepository.save(status);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'EmployeeStatus')
  findAll() {
    return this.statusRepository.find({ order: { name: 'ASC' } });
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id')
  @RequireAbility('read', 'EmployeeStatus')
  async findOne(@Param('id') id: string) {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) throw new NotFoundException('EmployeeStatus not found');
    return status;
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
  async remove(@Param('id') id: string) {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) throw new NotFoundException('EmployeeStatus not found');
    await this.statusRepository.remove(status);
  }
}

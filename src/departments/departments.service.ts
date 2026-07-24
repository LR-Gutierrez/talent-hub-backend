import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async findAll(params: { pageIndex: number; pageSize: number; query?: string }) {
    const { pageIndex, pageSize, query } = params;
    const skip = (pageIndex - 1) * pageSize;
    const where = query ? { name: ILike(`%${query}%`) } : {};
    const [list, total] = await this.departmentRepository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip,
      take: pageSize,
    });
    return { list, total, pageIndex, pageSize };
  }

  async findOne(id: string) {
    const dept = await this.departmentRepository.findOneBy({ id });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  create(dto: CreateDepartmentDto) {
    const dept = this.departmentRepository.create(dto);
    return this.departmentRepository.save(dept);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dept = await this.findOne(id);
    Object.assign(dept, dto);
    return this.departmentRepository.save(dept);
  }

  async remove(id: string) {
    const dept = await this.findOne(id);
    await this.departmentRepository.remove(dept);
  }
}

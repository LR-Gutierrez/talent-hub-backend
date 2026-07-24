import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post()
  @RequireAbility('create', 'Department')
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'Department')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
  ) {
    return this.departmentsService.findAll({
      pageIndex: pageIndex ? parseInt(pageIndex, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 100,
      query,
    });
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id')
  @RequireAbility('read', 'Department')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id')
  @RequireAbility('update', 'Department')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Delete(':id')
  @RequireAbility('delete', 'Department')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangeEmployeeStatusDto } from './dto/change-employee-status.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post()
  @RequireAbility('create', 'Employee')
  create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.employeesService.create(dto, req.user?.email);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'Employee')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('query') query?: string,
    @Query('sortKey') sortKey?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('statusId') statusId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.employeesService.findAll({
      pageIndex: pageIndex ? parseInt(pageIndex, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      query: query || '',
      sortKey,
      sortOrder,
      statusId,
      departmentId,
    });
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id')
  @RequireAbility('read', 'Employee')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id/history')
  @RequireAbility('read', 'Employee')
  getHistory(@Param('id') id: string) {
    return this.employeesService.getHistory(id);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id')
  @RequireAbility('update', 'Employee')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Req() req: any) {
    return this.employeesService.update(id, dto, req.user?.email);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id/status')
  @RequireAbility('update', 'Employee')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeEmployeeStatusDto, @Req() req: any) {
    return this.employeesService.changeStatus(id, dto, req.user?.email);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Delete(':id')
  @RequireAbility('delete', 'Employee')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}

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
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ChangeEmployeeStatusDto } from './dto/change-employee-status.dto';
import { BulkChangeEmployeeStatusDto } from './dto/bulk-change-employee-status.dto';
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
    @Query('withDeleted') withDeleted?: string,
  ) {
    return this.employeesService.findAll({
      pageIndex: pageIndex ? parseInt(pageIndex, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      query: query || '',
      sortKey,
      sortOrder,
      statusId,
      departmentId,
      withDeleted: withDeleted === 'true',
    });
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get('stats')
  @RequireAbility('read', 'Employee')
  getStats() {
    return this.employeesService.getStats();
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch('bulk-status')
  @RequireAbility('update', 'Employee')
  bulkChangeStatus(@Body() dto: BulkChangeEmployeeStatusDto, @Req() req: any) {
    return this.employeesService.bulkChangeStatus(dto, req.user?.email);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get(':id')
  @RequireAbility('read', 'Employee')
  findOne(@Param('id') id: string, @Query('withDeleted') withDeleted?: string) {
    return this.employeesService.findOne(id, withDeleted === 'true');
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
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    return this.employeesService.update(id, dto, req.user?.email);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id/status')
  @RequireAbility('update', 'Employee')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeEmployeeStatusDto,
    @Req() req: any,
  ) {
    return this.employeesService.changeStatus(id, dto, req.user?.email);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post(':id/photo')
  @RequireAbility('update', 'Employee')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(__dirname, '..', '..', 'uploads', 'employees');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.jpg';
          cb(null, `employee-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const employee = await this.employeesService.findOne(id);
    if (!employee) throw new NotFoundException('Employee not found');

    if (employee.photoUrl) {
      const oldPath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        'employees',
        employee.photoUrl.split('/').pop()!,
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photoUrl = `/uploads/employees/${file.filename}`;
    await this.employeesService.updatePhotoUrl(id, photoUrl);
    return { photoUrl };
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Delete(':id')
  @RequireAbility('delete', 'Employee')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Patch(':id/restore')
  @RequireAbility('update', 'Employee')
  restore(@Param('id') id: string) {
    return this.employeesService.restore(id);
  }
}

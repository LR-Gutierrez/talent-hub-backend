import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  NotFoundException, UseInterceptors, UploadedFile, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { BaseCatalogEntity } from './entities/base-catalog.entity';
import { Gender } from './entities/gender.entity';
import { MaritalStatus } from './entities/marital-status.entity';
import { EducationLevel } from './entities/education-level.entity';
import { EmployeeDegree } from './entities/employee-degree.entity';
import { UniformSize } from './entities/uniform-size.entity';
import { Country } from './entities/country.entity';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';

abstract class BaseCatalogController<T extends BaseCatalogEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  @Get()
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<{ list: T[]; total: number; pageIndex: number; pageSize: number }> {
    const take = pageSize ? parseInt(pageSize, 10) : 100;
    const skip = ((pageIndex ? parseInt(pageIndex, 10) : 1) - 1) * take;
    const [list, total] = await this.repository.findAndCount({
      order: { sortOrder: 'ASC' } as any,
      take,
      skip,
    });
    return { list, total, pageIndex: pageIndex ? parseInt(pageIndex, 10) : 1, pageSize: take };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as any });
    if (!entity) throw new NotFoundException();
    return entity;
  }

  @Post()
  async create(@Body() dto: CreateCatalogDto): Promise<T> {
    return this.repository.save(dto as any);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCatalogDto): Promise<T> {
    const entity = await this.repository.preload({ id, ...dto } as any);
    if (!entity) throw new NotFoundException();
    return this.repository.save(entity);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException();
  }
}

@Controller('genders')
export class GendersController extends BaseCatalogController<Gender> {
  constructor(@InjectRepository(Gender) repo: Repository<Gender>) { super(repo); }
}

@Controller('marital-statuses')
export class MaritalStatusesController extends BaseCatalogController<MaritalStatus> {
  constructor(@InjectRepository(MaritalStatus) repo: Repository<MaritalStatus>) { super(repo); }
}

@Controller('education-levels')
export class EducationLevelsController extends BaseCatalogController<EducationLevel> {
  constructor(@InjectRepository(EducationLevel) repo: Repository<EducationLevel>) { super(repo); }
}

@Controller('employee-degrees')
export class EmployeeDegreesController extends BaseCatalogController<EmployeeDegree> {
  constructor(@InjectRepository(EmployeeDegree) repo: Repository<EmployeeDegree>) { super(repo); }
}

@Controller('uniform-sizes')
export class UniformSizesController extends BaseCatalogController<UniformSize> {
  constructor(@InjectRepository(UniformSize) repo: Repository<UniformSize>) { super(repo); }
}

@Controller('countries')
export class CountriesController extends BaseCatalogController<Country> {
  private readonly logger = new Logger(CountriesController.name);

  constructor(@InjectRepository(Country) repo: Repository<Country>) { super(repo); }

  @Post(':id/flag')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(__dirname, '..', '..', 'uploads', 'flags');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.png';
          cb(null, `${file.fieldname}-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  async uploadFlag(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ flagUrl: string }> {
    const country = await this.repository.findOne({ where: { id } as any });
    if (!country) throw new NotFoundException();

    const flagDir = join(__dirname, '..', '..', 'uploads', 'flags');
    fs.mkdirSync(flagDir, { recursive: true });
    const ext = extname(file.originalname) || '.png';
    const filename = `${country.value}${ext}`;
    const destPath = join(flagDir, filename);

    if (fs.existsSync(destPath)) {
      fs.unlinkSync(destPath);
    }

    fs.renameSync(file.path, destPath);

    const flagUrl = `/uploads/flags/${filename}`;
    return { flagUrl };
  }

  @Delete(':id/flag')
  async deleteFlag(@Param('id') id: string): Promise<void> {
    const country = await this.repository.findOne({ where: { id } as any });
    if (!country) throw new NotFoundException();

    const flagDir = join(__dirname, '..', '..', 'uploads', 'flags');
    const pattern = `${country.value}.png`;
    const filePath = join(flagDir, pattern);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

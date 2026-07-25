import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import type { Response } from 'express';
import * as fs from 'fs';
import { EmployeesImportExportService } from './employees-import-export.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

@Controller('employees')
export class EmployeesImportExportController {
  constructor(private readonly importExportService: EmployeesImportExportService) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get('export/excel')
  @RequireAbility('read', 'Employee')
  async exportExcel(@Res() res: Response) {
    const buffer = await this.importExportService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=employees.xlsx',
    });
    res.end(buffer);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get('import/template')
  @RequireAbility('read', 'Employee')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.importExportService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=employees_import_template.xlsx',
    });
    res.end(buffer);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post('import/excel')
  @RequireAbility('create', 'Employee')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(__dirname, '..', '..', 'uploads', 'imports');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.xlsx';
          cb(null, `import-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowedExts = ['.xlsx', '.xls'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Only .xlsx and .xls files are allowed'), false);
        }
      },
    }),
  )
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Body() body: { autoCreateDepartments?: string; autoCreateBloodTypes?: string },
  ) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const autoCreateDepartments = body.autoCreateDepartments ? JSON.parse(body.autoCreateDepartments) : undefined;
      const autoCreateBloodTypes = body.autoCreateBloodTypes ? JSON.parse(body.autoCreateBloodTypes) : undefined;
      const result = await this.importExportService.importFromExcel(
        fileBuffer,
        req.user?.email,
        autoCreateDepartments,
        autoCreateBloodTypes,
      );

      try { fs.unlinkSync(file.path); } catch {}

      return result;
    } catch (err) {
      try { fs.unlinkSync(file.path); } catch {}
      throw err;
    }
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post('import/preview')
  @RequireAbility('create', 'Employee')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(__dirname, '..', '..', 'uploads', 'imports');
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.xlsx';
          cb(null, `preview-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowedExts = ['.xlsx', '.xls'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('Only .xlsx and .xls files are allowed'), false);
        }
      },
    }),
  )
  async previewExcel(
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const result = await this.importExportService.previewFromExcel(fileBuffer);

      try { fs.unlinkSync(file.path); } catch {}

      return result;
    } catch (err) {
      try { fs.unlinkSync(file.path); } catch {}
      throw err;
    }
  }
}

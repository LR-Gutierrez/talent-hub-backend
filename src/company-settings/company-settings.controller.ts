import { Controller, Get, Put, Post, Body, UseGuards, UseInterceptors, UploadedFile, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { CompanySettingsService } from './company-settings.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { RequireAbility } from '../casl/require-ability.decorator';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'company');

@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly settingsService: CompanySettingsService) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @Get()
  @RequireAbility('read', 'CompanySettings')
  get() {
    return this.settingsService.getSettings();
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Put()
  @RequireAbility('update', 'CompanySettings')
  update(@Body() dto: UpdateCompanySettingsDto) {
    return this.settingsService.updateSettings(dto);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post('logo')
  @RequireAbility('update', 'CompanySettings')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(UPLOADS_DIR, { recursive: true });
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.png';
          cb(null, `logo-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(png|jpeg|jpg|gif|svg\+xml|webp)$/)) {
          cb(new NotFoundException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    const settings = await this.settingsService.getSettings();
    if (settings.companyLogo && settings.companyLogo.startsWith('/uploads/')) {
      const oldPath = join(process.cwd(), settings.companyLogo);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    const logoUrl = `/uploads/company/${file.filename}`;
    await this.settingsService.updateSettings({ companyLogo: logoUrl });
    return { companyLogo: logoUrl };
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @Post('favicon')
  @RequireAbility('update', 'CompanySettings')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(UPLOADS_DIR, { recursive: true });
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '.ico';
          cb(null, `favicon-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 1 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(png|jpeg|jpg|gif|svg\+xml|webp|x-icon)$/) && !file.originalname.match(/\.(ico)$/)) {
          cb(new NotFoundException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    const settings = await this.settingsService.getSettings();
    if (settings.favicon && settings.favicon.startsWith('/uploads/')) {
      const oldPath = join(process.cwd(), settings.favicon);
      if (existsSync(oldPath)) unlinkSync(oldPath);
    }
    const faviconUrl = `/uploads/company/${file.filename}`;
    await this.settingsService.updateSettings({ favicon: faviconUrl });
    return { favicon: faviconUrl };
  }
}

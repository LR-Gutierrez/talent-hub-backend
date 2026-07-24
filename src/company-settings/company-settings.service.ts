import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './entities/company-settings.entity';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class CompanySettingsService {
  constructor(
    @InjectRepository(CompanySettings)
    private readonly settingsRepository: Repository<CompanySettings>,
  ) {}

  async getSettings() {
    let settings = await this.settingsRepository.findOne({
      where: { id: SETTINGS_ID },
    });
    if (!settings) {
      settings = this.settingsRepository.create({
        id: SETTINGS_ID,
        companyName: 'My Company',
        companyLogo: '/img/logo/logo-light-full.png',
        timezone: 'America/Caracas',
        dateFormat: 'DD/MM/YYYY',
        currency: 'PYG',
        defaultLang: 'es',
        favicon: '/favicon.ico',
      });
      settings = await this.settingsRepository.save(settings);
    } else {
      let needsSave = false;
      if (settings.companyLogo === null || settings.companyLogo === undefined) {
        settings.companyLogo = '/img/logo/logo-light-full.png';
        needsSave = true;
      }
      if (settings.favicon === null || settings.favicon === undefined) {
        settings.favicon = '/favicon.ico';
        needsSave = true;
      }
      if (needsSave) {
        settings = await this.settingsRepository.save(settings);
      }
    }
    return settings;
  }

  async updateSettings(dto: UpdateCompanySettingsDto) {
    const settings = await this.getSettings();
    Object.assign(settings, dto);
    return this.settingsRepository.save(settings);
  }
}

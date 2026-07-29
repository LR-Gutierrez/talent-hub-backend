import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettingsService } from './company-settings.service';
import { CompanySettings } from './entities/company-settings.entity';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const defaultSettings = {
  id: SETTINGS_ID,
  companyName: 'My Company',
  companyLogo: '/img/logo/logo-light-full.png',
  timezone: 'America/Caracas',
  dateFormat: 'DD/MM/YYYY',
  currency: 'USD',
  defaultLang: 'es',
  favicon: '/favicon.ico',
  companyRuc: null,
  companyAddress: null,
  companyPhone: null,
  companyEmail: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('CompanySettingsService', () => {
  let service: CompanySettingsService;
  let repository: jest.Mocked<Repository<CompanySettings>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanySettingsService,
        {
          provide: getRepositoryToken(CompanySettings),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompanySettingsService>(CompanySettingsService);
    repository = module.get(getRepositoryToken(CompanySettings));
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      repository.findOne.mockResolvedValue(defaultSettings);

      const result = await service.getSettings();

      expect(result).toEqual(defaultSettings);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: SETTINGS_ID },
      });
    });

    it('should create default settings when none exist', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(defaultSettings);
      repository.save.mockResolvedValue(defaultSettings);

      const result = await service.getSettings();

      expect(repository.create).toHaveBeenCalledWith({
        id: SETTINGS_ID,
        companyName: 'My Company',
        companyLogo: '/img/logo/logo-light-full.png',
        timezone: 'America/Caracas',
        dateFormat: 'DD/MM/YYYY',
        currency: 'USD',
        defaultLang: 'es',
        favicon: '/favicon.ico',
      });
      expect(repository.save).toHaveBeenCalledWith(defaultSettings);
      expect(result).toEqual(defaultSettings);
    });

    it('should restore null companyLogo to default', async () => {
      const settingsWithNullLogo = { ...defaultSettings, companyLogo: null };
      repository.findOne.mockResolvedValue(settingsWithNullLogo);
      repository.save.mockResolvedValue({
        ...settingsWithNullLogo,
        companyLogo: '/img/logo/logo-light-full.png',
      });

      const result = await service.getSettings();

      expect(repository.save).toHaveBeenCalled();
      expect(result.companyLogo).toBe('/img/logo/logo-light-full.png');
    });

    it('should restore null favicon to default', async () => {
      const settingsWithNullFavicon = { ...defaultSettings, favicon: null };
      repository.findOne.mockResolvedValue(settingsWithNullFavicon);
      repository.save.mockResolvedValue({
        ...settingsWithNullFavicon,
        favicon: '/favicon.ico',
      });

      const result = await service.getSettings();

      expect(repository.save).toHaveBeenCalled();
      expect(result.favicon).toBe('/favicon.ico');
    });

    it('should restore both null companyLogo and null favicon', async () => {
      const settingsWithNulls = {
        ...defaultSettings,
        companyLogo: null,
        favicon: null,
      };
      repository.findOne.mockResolvedValue(settingsWithNulls);
      repository.save.mockResolvedValue({
        ...settingsWithNulls,
        companyLogo: '/img/logo/logo-light-full.png',
        favicon: '/favicon.ico',
      });

      const result = await service.getSettings();

      expect(repository.save).toHaveBeenCalled();
      expect(result.companyLogo).toBe('/img/logo/logo-light-full.png');
      expect(result.favicon).toBe('/favicon.ico');
    });
  });

  describe('updateSettings', () => {
    it('should update and return the updated settings', async () => {
      const dto: UpdateCompanySettingsDto = {
        companyName: 'New Co',
        timezone: 'UTC',
      };
      const updated = {
        ...defaultSettings,
        ...dto,
        updatedAt: new Date('2025-02-01'),
      };

      repository.findOne.mockResolvedValue(defaultSettings);
      repository.save.mockResolvedValue(updated);

      const result = await service.updateSettings(dto);

      expect(repository.save).toHaveBeenCalledWith({
        ...defaultSettings,
        ...dto,
      });
      expect(result.companyName).toBe('New Co');
      expect(result.timezone).toBe('UTC');
    });

    it('should create defaults if no settings exist, then apply update', async () => {
      const dto: UpdateCompanySettingsDto = { companyName: 'Startup' };
      const created = { ...defaultSettings, ...dto };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(defaultSettings);
      repository.save.mockResolvedValueOnce(defaultSettings);
      repository.save.mockResolvedValueOnce(created);

      const result = await service.updateSettings(dto);

      expect(result.companyName).toBe('Startup');
    });
  });
});

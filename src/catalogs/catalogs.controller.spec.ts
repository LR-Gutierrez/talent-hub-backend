import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { GendersController, CountriesController } from './catalogs.controller';
import { Gender } from './entities/gender.entity';
import { Country } from './entities/country.entity';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  renameSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('GendersController', () => {
  let controller: GendersController;
  let repository: jest.Mocked<Repository<Gender>>;

  const mockEntity: Gender = {
    id: 'gender-1',
    name: 'Male',
    value: 'male',
    sortOrder: 1,
    isActive: true,
    translations: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    displayName: undefined,
  };

  beforeEach(async () => {
    repository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      preload: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GendersController],
      providers: [
        { provide: getRepositoryToken(Gender), useValue: repository },
      ],
    }).compile();

    controller = module.get<GendersController>(GendersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated list without query', async () => {
      repository.findAndCount.mockResolvedValue([[mockEntity], 1]);

      const result = await controller.findAll('1', '10');

      expect(repository.findAndCount).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC' },
        take: 10,
        skip: 0,
        where: {},
        withDeleted: false,
      });
      expect(result).toEqual({
        list: [mockEntity],
        total: 1,
        pageIndex: 1,
        pageSize: 10,
      });
    });

    it('should filter by query', async () => {
      repository.findAndCount.mockResolvedValue([[mockEntity], 1]);

      await controller.findAll('1', '10', 'Male');

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: ILike('%Male%') },
        }),
      );
    });

    it('should include deleted when withDeleted=true', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await controller.findAll('1', '10', '', undefined, 'true');

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });

    it('should resolve displayName from translations when locale is provided', async () => {
      const entityWithTranslations = {
        ...mockEntity,
        name: 'Male',
        translations: { es: 'Masculino', fr: 'Masculin' },
      };
      repository.findAndCount.mockResolvedValue([[entityWithTranslations], 1]);

      const result = await controller.findAll('1', '10', '', 'es');

      expect((result.list[0] as any).displayName).toBe('Masculino');
    });

    it('should fall back to name when locale translation is missing', async () => {
      const entityWithTranslations = {
        ...mockEntity,
        name: 'Male',
        translations: { es: 'Masculino' },
      };
      repository.findAndCount.mockResolvedValue([[entityWithTranslations], 1]);

      const result = await controller.findAll('1', '10', '', 'fr');

      expect((result.list[0] as any).displayName).toBe('Male');
    });
  });

  describe('findOne', () => {
    it('should return an entity by id', async () => {
      repository.findOne.mockResolvedValue(mockEntity);

      const result = await controller.findOne('gender-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'gender-1' },
        withDeleted: false,
      });
      expect(result).toEqual(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(controller.findOne('gender-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return the entity', async () => {
      const dto = { name: 'Female', value: 'female', sortOrder: 2 };
      repository.save.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.create(dto);

      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expect.objectContaining(dto));
    });
  });

  describe('update', () => {
    it('should update an existing entity', async () => {
      const dto = { name: 'Updated' };
      repository.preload.mockResolvedValue({ ...mockEntity, ...dto });
      repository.save.mockResolvedValue({ ...mockEntity, ...dto });

      const result = await controller.update('gender-1', dto);

      expect(repository.preload).toHaveBeenCalledWith({
        id: 'gender-1',
        name: 'Updated',
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      repository.preload.mockResolvedValue(null);

      await expect(
        controller.update('gender-999', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete an existing entity', async () => {
      repository.findOne.mockResolvedValue(mockEntity);
      repository.softRemove.mockResolvedValue(undefined);

      await controller.remove('gender-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'gender-1' },
      });
      expect(repository.softRemove).toHaveBeenCalledWith(mockEntity);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(controller.remove('gender-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted entity', async () => {
      repository.findOne.mockResolvedValue(mockEntity);
      repository.restore.mockResolvedValue({ generatedMaps: [], raw: [] });

      await controller.restore('gender-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'gender-1' },
        withDeleted: true,
      });
      expect(repository.restore).toHaveBeenCalledWith('gender-1');
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(controller.restore('gender-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

describe('CountriesController', () => {
  let controller: CountriesController;
  let repository: jest.Mocked<Repository<Country>>;

  const mockCountry: Country = {
    id: 'country-1',
    name: 'United States',
    value: 'US',
    dialCode: '+1',
    sortOrder: 1,
    isActive: true,
    translations: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    displayName: undefined,
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        { provide: getRepositoryToken(Country), useValue: repository },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFlag', () => {
    it('should upload a flag file and return flagUrl', async () => {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'flags');
      const destPath = path.join(uploadsDir, 'US.png');

      repository.findOne.mockResolvedValue(mockCountry);

      const file = {
        originalname: 'flag.png',
        path: '/tmp/test-flag.png',
        mimetype: 'image/png',
      } as Express.Multer.File;

      mockFs.existsSync.mockReturnValue(false);
      mockFs.renameSync.mockReturnValue(undefined);

      const result = await controller.uploadFlag('country-1', file);

      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.renameSync).toHaveBeenCalledWith(file.path, destPath);
      expect(result).toEqual({ flagUrl: '/uploads/flags/US.png' });
    });

    it('should overwrite existing flag file', async () => {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'flags');
      const destPath = path.join(uploadsDir, 'US.png');

      repository.findOne.mockResolvedValue(mockCountry);

      const file = {
        originalname: 'new-flag.png',
        path: '/tmp/new-flag.png',
        mimetype: 'image/png',
      } as Express.Multer.File;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.renameSync.mockReturnValue(undefined);

      const result = await controller.uploadFlag('country-1', file);

      expect(mockFs.unlinkSync).toHaveBeenCalledWith(destPath);
      expect(result).toEqual({ flagUrl: '/uploads/flags/US.png' });
    });

    it('should throw NotFoundException when country does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        controller.uploadFlag('country-999', {} as Express.Multer.File),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFlag', () => {
    it('should delete the flag file if it exists', async () => {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'flags');
      const filePath = path.join(uploadsDir, 'US.png');

      repository.findOne.mockResolvedValue(mockCountry);

      mockFs.existsSync.mockReturnValue(true);

      await controller.deleteFlag('country-1');

      expect(mockFs.unlinkSync).toHaveBeenCalledWith(filePath);
    });

    it('should do nothing if flag file does not exist', async () => {
      repository.findOne.mockResolvedValue(mockCountry);

      mockFs.existsSync.mockReturnValue(false);

      await controller.deleteFlag('country-1');

      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when country does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(controller.deleteFlag('country-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

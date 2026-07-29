import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mocked-hash'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    displayName: 'Test User',
    photoUrl: null,
    role: UserRole.CANDIDATE,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    repository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users without query', async () => {
      repository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: {},
        skip: 0,
        take: 10,
        withDeleted: undefined,
      });
      expect(result).toEqual({ list: [mockUser], total: 1 });
    });

    it('should search by displayName and email', async () => {
      repository.findAndCount.mockResolvedValue([[mockUser], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: 'test',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [{ displayName: ILike('%test%') }, { email: ILike('%test%') }],
        }),
      );
    });

    it('should apply sorting', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sortKey: 'email',
        sortOrder: 'DESC',
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { email: 'DESC' },
        }),
      );
    });

    it('should include deleted records when withDeleted is true', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        withDeleted: true,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        withDeleted: false,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('user-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      };
      repository.create.mockReturnValue({ ...mockUser, ...dto });
      repository.save.mockResolvedValue({ ...mockUser, ...dto });

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe('new@example.com');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue({
        ...mockUser,
        displayName: 'Updated Name',
      });

      const result = await service.update('user-1', {
        displayName: 'Updated Name',
      });

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ displayName: 'Updated Name' }),
      );
      expect(result.displayName).toBe('Updated Name');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('user-999', { displayName: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should hash and update the password', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-pw');
      repository.save.mockResolvedValue({
        ...mockUser,
        password: 'new-hashed-pw',
      });

      const result = await service.changePassword('user-1', 'new-password');

      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'new-hashed-pw' }),
      );
      expect(result.password).toBe('new-hashed-pw');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('user-999', 'new-password'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete a user', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await service.remove('user-2');

      expect(repository.softRemove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ForbiddenException when deleting own account', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      await expect(service.remove('user-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('user-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.restore.mockResolvedValue({ generatedMaps: [], raw: [] });

      await service.restore('user-1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        withDeleted: true,
      });
      expect(repository.restore).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.restore('user-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

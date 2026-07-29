import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { EmployeeStatusesController } from './employee-statuses.controller';
import { EmployeeStatus } from './entities/employee-status.entity';
import { Employee } from './entities/employee.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('EmployeeStatusesController', () => {
  let controller: EmployeeStatusesController;
  let statusRepository: jest.Mocked<Repository<EmployeeStatus>>;
  let employeeRepository: jest.Mocked<Repository<Employee>>;
  let historyRepository: jest.Mocked<Repository<EmployeeHistory>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockStatus: EmployeeStatus = {
    id: 'status-1',
    name: 'Active',
    description: 'Active employee',
    color: '#00ff00',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  };

  const mockManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
    getRepository: jest.fn().mockReturnThis(),
  };

  function resetMockManager() {
    mockManager.findOne.mockReset().mockResolvedValue(null);
    mockManager.find.mockReset().mockResolvedValue([]);
    mockManager.create
      .mockReset()
      .mockImplementation((_entity: any, data: any) => data);
    mockManager.save
      .mockReset()
      .mockImplementation(async (_entity: any, data: any) => data);
    mockManager.softRemove.mockReset().mockResolvedValue(undefined);
    mockManager.getRepository.mockReset().mockReturnThis();
  }

  beforeEach(async () => {
    statusRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
      findOneBy: jest.fn(),
    } as any;

    employeeRepository = {
      count: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    } as any;

    historyRepository = {
      save: jest.fn(),
    } as any;

    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation(async (cb: any) => cb(mockManager)),
    } as any;

    resetMockManager();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeStatusesController],
      providers: [
        {
          provide: getRepositoryToken(EmployeeStatus),
          useValue: statusRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: employeeRepository,
        },
        {
          provide: getRepositoryToken(EmployeeHistory),
          useValue: historyRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    controller = module.get<EmployeeStatusesController>(
      EmployeeStatusesController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a status when name is unique', async () => {
      statusRepository.findOne.mockResolvedValue(null);
      statusRepository.create.mockReturnValue(mockStatus);
      statusRepository.save.mockResolvedValue(mockStatus);

      const result = await controller.create({
        name: 'Active',
        description: 'Active employee',
        color: '#00ff00',
      });

      expect(statusRepository.findOne).toHaveBeenCalledWith({
        where: { name: ILike('Active') },
        withDeleted: true,
      });
      expect(statusRepository.create).toHaveBeenCalledWith({
        name: 'Active',
        description: 'Active employee',
        color: '#00ff00',
      });
      expect(statusRepository.save).toHaveBeenCalledWith(mockStatus);
      expect(result).toEqual(mockStatus);
    });

    it('should throw BadRequestException when name already exists', async () => {
      statusRepository.findOne.mockResolvedValue(mockStatus);

      await expect(controller.create({ name: 'Active' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated statuses without query', async () => {
      statusRepository.findAndCount.mockResolvedValue([[mockStatus], 1]);

      const result = await controller.findAll('1', '10');

      expect(statusRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC' },
        take: 10,
        skip: 0,
        withDeleted: false,
      });
      expect(result).toEqual({
        list: [mockStatus],
        total: 1,
        pageIndex: 1,
        pageSize: 10,
      });
    });

    it('should search by query using ILike', async () => {
      statusRepository.findAndCount.mockResolvedValue([[mockStatus], 1]);

      await controller.findAll('1', '10', 'Act');

      expect(statusRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: ILike('%Act%') },
        order: { name: 'ASC' },
        take: 10,
        skip: 0,
        withDeleted: false,
      });
    });

    it('should pass withDeleted=true when requested', async () => {
      statusRepository.findAndCount.mockResolvedValue([[], 0]);

      await controller.findAll('1', '10', '', 'true');

      expect(statusRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a status by id', async () => {
      statusRepository.findOne.mockResolvedValue(mockStatus);

      const result = await controller.findOne('status-1');

      expect(statusRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'status-1' },
        withDeleted: false,
      });
      expect(result).toEqual(mockStatus);
    });

    it('should throw NotFoundException when not found', async () => {
      statusRepository.findOne.mockResolvedValue(null);

      await expect(controller.findOne('status-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEmployeeCount', () => {
    it('should return employee count', async () => {
      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.count.mockResolvedValue(5);

      const result = await controller.getEmployeeCount('status-1');

      expect(employeeRepository.count).toHaveBeenCalledWith({
        where: { statusId: 'status-1' },
      });
      expect(result).toEqual({ employeeCount: 5 });
    });

    it('should throw NotFoundException when status does not exist', async () => {
      statusRepository.findOneBy.mockResolvedValue(null);

      await expect(controller.getEmployeeCount('status-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a status', async () => {
      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      statusRepository.save.mockResolvedValue({
        ...mockStatus,
        description: 'Updated description',
      });

      const result = await controller.update('status-1', {
        description: 'Updated description',
      });

      expect(statusRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Updated description' }),
      );
      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException when not found', async () => {
      statusRepository.findOneBy.mockResolvedValue(null);

      await expect(
        controller.update('status-999', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft-delete when no employees assigned', async () => {
      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.count.mockResolvedValue(0);

      const result = await controller.remove('status-1', {} as any);

      expect(statusRepository.softRemove).toHaveBeenCalledWith(mockStatus);
      expect(result).toEqual({ success: true });
    });

    it('should throw ConflictException when employees exist and no force', async () => {
      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.count.mockResolvedValue(3);

      await expect(controller.remove('status-1', {} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reassign employees to target status with force', async () => {
      const mockTargetStatus: EmployeeStatus = {
        ...mockStatus,
        id: 'status-2',
        name: 'Inactive',
      };
      const mockEmployees = [
        { id: 'emp-1', statusId: 'status-1' },
        { id: 'emp-2', statusId: 'status-1' },
      ];

      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.count.mockResolvedValue(2);

      mockManager.findOne.mockImplementation(async (...args: any[]) => {
        const opts = args.length >= 2 ? args[1] : args[0];
        if (opts?.where?.id === 'status-1') return mockStatus;
        if (opts?.where?.id === 'status-2') return mockTargetStatus;
        return null;
      });
      mockManager.find.mockResolvedValue(mockEmployees);
      mockManager.save.mockImplementation(
        async (_entity: any, data: any) => data,
      );
      mockManager.create.mockImplementation((_entity: any, data: any) => data);

      const result = await controller.remove(
        'status-1',
        { user: { email: 'admin@test.com' } } as any,
        'true',
        'status-2',
      );

      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toEqual({
        movedCount: 2,
        targetStatusName: 'Inactive',
      });
    });

    it('should create a new status when newStatusName is provided', async () => {
      const mockEmployees = [{ id: 'emp-1', statusId: 'status-1' }];
      const mockNewStatus: EmployeeStatus = {
        ...mockStatus,
        id: 'status-new',
        name: 'New Status',
      };

      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.count.mockResolvedValue(1);

      mockManager.findOne.mockImplementation(async (...args: any[]) => {
        const opts = args.length >= 2 ? args[1] : args[0];
        if (opts?.where?.id === 'status-1') return mockStatus;
        return null;
      });
      mockManager.find.mockResolvedValue(mockEmployees);
      mockManager.create.mockImplementation((_entity: any, data: any) => data);
      mockManager.save.mockImplementation(async (_entity: any, data: any) => {
        if (data?.name === 'New Status') return mockNewStatus;
        return data;
      });

      const result = await controller.remove(
        'status-1',
        { user: { email: 'admin@test.com' } } as any,
        'true',
        undefined,
        'New Status',
      );

      expect(result).toEqual({
        movedCount: 1,
        targetStatusName: 'New Status',
      });
    });

    it('should throw BadRequestException when target is the same status', async () => {
      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.count.mockResolvedValue(2);

      mockManager.findOne.mockImplementation(async (...args: any[]) => {
        const opts = args.length >= 2 ? args[1] : args[0];
        if (opts?.where?.id === 'status-1') return mockStatus;
        return null;
      });
      mockManager.find.mockResolvedValue([]);

      await expect(
        controller.remove(
          'status-1',
          { user: { email: 'admin@test.com' } } as any,
          'true',
          'status-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when original status does not exist', async () => {
      statusRepository.findOneBy.mockResolvedValue(null);

      await expect(controller.remove('status-999', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted status', async () => {
      statusRepository.findOne.mockResolvedValue(mockStatus);
      statusRepository.restore.mockResolvedValue({
        generatedMaps: [],
        raw: [],
      });

      const result = await controller.restore('status-1');

      expect(statusRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'status-1' },
        withDeleted: true,
      });
      expect(statusRepository.restore).toHaveBeenCalledWith('status-1');
      expect(result).toEqual({ generatedMaps: [], raw: [] });
    });

    it('should throw NotFoundException when not found', async () => {
      statusRepository.findOne.mockResolvedValue(null);

      await expect(controller.restore('status-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

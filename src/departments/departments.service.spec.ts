import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, ILike } from 'typeorm';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeHistory } from '../employees/entities/employee-history.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let departmentRepository: jest.Mocked<Repository<Department>>;
  let employeeRepository: jest.Mocked<Repository<Employee>>;
  let historyRepository: jest.Mocked<Repository<EmployeeHistory>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockDepartment: Department = {
    id: 'dept-1',
    name: 'Engineering',
    description: 'Engineering department',
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
    departmentRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      softRemove: jest.fn(),
      restore: jest.fn(),
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
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: departmentRepository,
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

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a department when name is unique', async () => {
      departmentRepository.findOne.mockResolvedValue(null);
      departmentRepository.create.mockReturnValue(mockDepartment);
      departmentRepository.save.mockResolvedValue(mockDepartment);

      const result = await service.create({
        name: 'Engineering',
        description: 'Engineering department',
      });

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { name: ILike('Engineering') },
        withDeleted: true,
      });
      expect(departmentRepository.create).toHaveBeenCalledWith({
        name: 'Engineering',
        description: 'Engineering department',
      });
      expect(departmentRepository.save).toHaveBeenCalledWith(mockDepartment);
      expect(result).toEqual(mockDepartment);
    });

    it('should throw BadRequestException when name already exists', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);

      await expect(service.create({ name: 'Engineering' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated departments without query', async () => {
      departmentRepository.findAndCount.mockResolvedValue([
        [mockDepartment],
        1,
      ]);

      const result = await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
      });

      expect(departmentRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC' },
        skip: 0,
        take: 10,
        withDeleted: undefined,
      });
      expect(result).toEqual({
        list: [mockDepartment],
        total: 1,
        pageIndex: 1,
        pageSize: 10,
      });
    });

    it('should search by query using ILike', async () => {
      departmentRepository.findAndCount.mockResolvedValue([
        [mockDepartment],
        1,
      ]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: 'Eng',
      });

      expect(departmentRepository.findAndCount).toHaveBeenCalledWith({
        where: { name: ILike('%Eng%') },
        order: { name: 'ASC' },
        skip: 0,
        take: 10,
        withDeleted: undefined,
      });
    });

    it('should pass withDeleted=true when requested', async () => {
      departmentRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        withDeleted: true,
      });

      expect(departmentRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);

      const result = await service.findOne('dept-1');

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        withDeleted: false,
      });
      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException when not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('dept-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a department', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      departmentRepository.save.mockResolvedValue({
        ...mockDepartment,
        description: 'Updated description',
      });

      const result = await service.update('dept-1', {
        description: 'Updated description',
      });

      expect(departmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Updated description' }),
      );
      expect(result.description).toBe('Updated description');
    });

    it('should throw NotFoundException when not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('dept-999', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEmployeeCount', () => {
    it('should return employee count', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      employeeRepository.count.mockResolvedValue(5);

      const result = await service.getEmployeeCount('dept-1');

      expect(employeeRepository.count).toHaveBeenCalledWith({
        where: { departmentId: 'dept-1' },
      });
      expect(result).toBe(5);
    });

    it('should throw NotFoundException when department does not exist', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.getEmployeeCount('dept-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete when no employees assigned', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      employeeRepository.count.mockResolvedValue(0);

      const result = await service.remove('dept-1');

      expect(departmentRepository.softRemove).toHaveBeenCalledWith(
        mockDepartment,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw ConflictException when employees exist and no force', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      employeeRepository.count.mockResolvedValue(3);

      await expect(service.remove('dept-1')).rejects.toThrow(ConflictException);
    });

    it('should reassign employees to target department with force', async () => {
      const mockTargetDept: Department = {
        ...mockDepartment,
        id: 'dept-2',
        name: 'QA',
      };
      const mockEmployees = [
        { id: 'emp-1', departmentId: 'dept-1' },
        { id: 'emp-2', departmentId: 'dept-1' },
      ];

      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      employeeRepository.count.mockResolvedValue(2);

      mockManager.findOne.mockImplementation(async (...args: any[]) => {
        const opts = args.length >= 2 ? args[1] : args[0];
        if (opts?.where?.id === 'dept-1') return mockDepartment;
        if (opts?.where?.id === 'dept-2') return mockTargetDept;
        return null;
      });
      mockManager.find.mockResolvedValue(mockEmployees);
      mockManager.save.mockImplementation(
        async (_entity: any, data: any) => data,
      );
      mockManager.create.mockImplementation((_entity: any, data: any) => data);

      const result = await service.remove('dept-1', 'admin', true, 'dept-2');

      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toEqual({
        movedCount: 2,
        targetDepartmentName: 'QA',
      });
    });

    it('should create a new department when newDepartmentName is provided', async () => {
      const mockEmployees = [{ id: 'emp-1', departmentId: 'dept-1' }];
      const mockNewDept: Department = {
        ...mockDepartment,
        id: 'dept-new',
        name: 'New Dept',
      };

      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      employeeRepository.count.mockResolvedValue(1);

      mockManager.findOne.mockImplementation(async (...args: any[]) => {
        const opts = args.length >= 2 ? args[1] : args[0];
        if (opts?.where?.id === 'dept-1') return mockDepartment;
        return null;
      });
      mockManager.find.mockResolvedValue(mockEmployees);
      mockManager.create.mockImplementation((_entity: any, data: any) => data);

      let saveCallCount = 0;
      mockManager.save.mockImplementation(async (_entity: any, data: any) => {
        saveCallCount++;
        if (saveCallCount === 1 && data?.name === 'New Dept')
          return mockNewDept;
        return data;
      });

      const result = await service.remove(
        'dept-1',
        'admin',
        true,
        undefined,
        'New Dept',
      );

      expect(result).toEqual({
        movedCount: 1,
        targetDepartmentName: 'New Dept',
      });
    });

    it('should throw BadRequestException when target is the same department', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      employeeRepository.count.mockResolvedValue(2);

      mockManager.findOne.mockImplementation(async (...args: any[]) => {
        const opts = args.length >= 2 ? args[1] : args[0];
        if (opts?.where?.id === 'dept-1') return mockDepartment;
        return null;
      });
      mockManager.find.mockResolvedValue([]);

      await expect(
        service.remove('dept-1', 'admin', true, 'dept-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('restore', () => {
    it('should restore a deleted department', async () => {
      departmentRepository.findOne.mockResolvedValue(mockDepartment);
      departmentRepository.restore.mockResolvedValue({
        generatedMaps: [],
        raw: [],
      });

      const result = await service.restore('dept-1');

      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        withDeleted: true,
      });
      expect(departmentRepository.restore).toHaveBeenCalledWith('dept-1');
      expect(result).toEqual({ generatedMaps: [], raw: [] });
    });

    it('should throw NotFoundException when not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.restore('dept-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

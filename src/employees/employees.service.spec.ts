import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { EmployeeStatus } from './entities/employee-status.entity';
import { EmployeeHistory } from './entities/employee-history.entity';
import { EmployeeEducation } from './entities/employee-education.entity';
import { EmployeeUniform } from './entities/employee-uniform.entity';
import { EmployeeChild } from './entities/employee-child.entity';
import { EmployeeEmergencyContact } from './entities/employee-emergency-contact.entity';
import { Department } from '../departments/entities/department.entity';
import { Gender } from '../catalogs/entities/gender.entity';
import { NotFoundException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: jest.Mocked<Repository<Employee>>;
  let statusRepository: jest.Mocked<Repository<EmployeeStatus>>;
  let historyRepository: jest.Mocked<Repository<EmployeeHistory>>;
  let educationRepository: jest.Mocked<Repository<EmployeeEducation>>;
  let uniformRepository: jest.Mocked<Repository<EmployeeUniform>>;
  let childRepository: jest.Mocked<Repository<EmployeeChild>>;
  let emergencyContactRepository: jest.Mocked<
    Repository<EmployeeEmergencyContact>
  >;
  let departmentRepository: jest.Mocked<Repository<Department>>;
  let genderRepository: jest.Mocked<Repository<Gender>>;

  const mockStatus: EmployeeStatus = {
    id: 'status-1',
    name: 'Active',
    color: '#00ff00',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  } as any;

  const mockEmployee: Employee = {
    id: 'emp-1',
    fullName: 'John Doe',
    email: 'john@test.com',
    phone: '555-0100',
    statusId: 'status-1',
    status: mockStatus,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
  } as any;

  beforeEach(async () => {
    employeeRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      recover: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    statusRepository = {
      findOneBy: jest.fn(),
      count: jest.fn(),
    } as any;

    historyRepository = {
      save: jest.fn(),
      find: jest.fn(),
    } as any;

    educationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    } as any;

    uniformRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    } as any;

    childRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    emergencyContactRepository = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    departmentRepository = {
      count: jest.fn(),
      findOne: jest.fn(),
    } as any;

    genderRepository = {
      count: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(Employee), useValue: employeeRepository },
        {
          provide: getRepositoryToken(EmployeeStatus),
          useValue: statusRepository,
        },
        {
          provide: getRepositoryToken(EmployeeHistory),
          useValue: historyRepository,
        },
        {
          provide: getRepositoryToken(EmployeeEducation),
          useValue: educationRepository,
        },
        {
          provide: getRepositoryToken(EmployeeUniform),
          useValue: uniformRepository,
        },
        {
          provide: getRepositoryToken(EmployeeChild),
          useValue: childRepository,
        },
        {
          provide: getRepositoryToken(EmployeeEmergencyContact),
          useValue: emergencyContactRepository,
        },
        {
          provide: getRepositoryToken(Department),
          useValue: departmentRepository,
        },
        { provide: getRepositoryToken(Gender), useValue: genderRepository },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated employees without filters', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      const result = await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        order: { fullName: 'ASC' },
        skip: 0,
        take: 10,
        withDeleted: undefined,
        relations: {
          status: true,
          supervisor: true,
          department: true,
          nationalityRef: true,
          placeOfBirthRef: true,
          maritalStatusRef: true,
          genderRef: true,
        },
      });
      expect(result).toEqual({ list: [mockEmployee], total: 1 });
    });

    it('should filter by query using ILike on fullName', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: 'John',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { fullName: ILike('%John%') },
        }),
      );
    });

    it('should filter by statusId and departmentId', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        statusId: 'status-1',
        departmentId: 'dept-1',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { statusId: 'status-1', departmentId: 'dept-1' },
        }),
      );
    });

    it('should sort by department name relation', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sortKey: 'department',
        sortOrder: 'DESC',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { department: { name: 'DESC' } },
        }),
      );
    });

    it('should sort by status name relation', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sortKey: 'status',
        sortOrder: 'ASC',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { status: { name: 'ASC' } },
        }),
      );
    });

    it('should sort by supervisor fullName relation', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sortKey: 'supervisor',
        sortOrder: 'ASC',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { supervisor: { fullName: 'ASC' } },
        }),
      );
    });

    it('should sort by direct field', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[mockEmployee], 1]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        sortKey: 'fullName',
        sortOrder: 'DESC',
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { fullName: 'DESC' },
        }),
      );
    });

    it('should pass withDeleted when requested', async () => {
      employeeRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({
        pageIndex: 1,
        pageSize: 10,
        query: '',
        withDeleted: true,
      });

      expect(employeeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ withDeleted: true }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne('emp-1');

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        withDeleted: false,
        relations: {
          status: true,
          supervisor: true,
          department: true,
          educations: true,
          uniforms: true,
          children: true,
          emergencyContacts: true,
          nationalityRef: true,
          placeOfBirthRef: true,
          maritalStatusRef: true,
          genderRef: true,
          bloodTypeRef: true,
        },
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('emp-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      fullName: 'Jane Doe',
      email: 'jane@test.com',
      statusId: 'status-1',
      children: [{ fullName: 'Child1', birthDate: '2020-01-01' }],
      emergencyContacts: [{ fullName: 'Contact1', phone: '555-0200' }],
      educationLevel: 'Bachelor',
      degree: 'CS',
      institution: 'MIT',
      graduationYear: '2020',
      shirtSize: 'M',
      pantSize: '32',
      shoeSize: '10',
      jacketSize: 'L',
      helmetSize: 'M',
    };

    it('should create an employee with all nested entities', async () => {
      statusRepository.findOneBy.mockResolvedValue(mockStatus);
      employeeRepository.create.mockReturnValue(mockEmployee);
      employeeRepository.save.mockResolvedValue(mockEmployee);
      employeeRepository.findOne.mockResolvedValue(mockEmployee);

      childRepository.create.mockImplementation((_dto: any) => _dto);
      childRepository.save.mockResolvedValue([]);

      emergencyContactRepository.create.mockImplementation((_dto: any) => _dto);
      emergencyContactRepository.save.mockResolvedValue([]);

      educationRepository.create.mockReturnValue({} as any);
      educationRepository.save.mockResolvedValue({} as any);

      uniformRepository.create.mockReturnValue({} as any);
      uniformRepository.save.mockResolvedValue({} as any);

      historyRepository.save.mockResolvedValue({} as any);

      const result = await service.create(createDto as any, 'admin');

      expect(statusRepository.findOneBy).toHaveBeenCalledWith({
        id: 'status-1',
      });
      expect(employeeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Jane Doe',
          email: 'jane@test.com',
          statusId: 'status-1',
        }),
      );
      expect(childRepository.save).toHaveBeenCalled();
      expect(emergencyContactRepository.save).toHaveBeenCalled();
      expect(educationRepository.save).toHaveBeenCalled();
      expect(uniformRepository.save).toHaveBeenCalled();
      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          changedField: 'status',
          newValue: 'Active',
          notes: 'Employee created',
          changedBy: 'admin',
        }),
      );
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when status is invalid', async () => {
      statusRepository.findOneBy.mockResolvedValue(null);

      await expect(service.create(createDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      fullName: 'John Updated',
      email: 'john.updated@test.com',
      educationLevel: 'Master',
      degree: 'MSc',
      institution: 'Stanford',
      graduationYear: '2022',
      shirtSize: 'L',
      children: [],
      emergencyContacts: [],
    };

    it('should update employee fields and create history for changes', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.save.mockResolvedValue({
        ...mockEmployee,
        fullName: 'John Updated',
        email: 'john.updated@test.com',
      });

      educationRepository.findOneBy.mockResolvedValue(null);
      uniformRepository.findOneBy.mockResolvedValue(null);

      educationRepository.create.mockReturnValue({} as any);
      educationRepository.save.mockResolvedValue({} as any);

      uniformRepository.create.mockReturnValue({} as any);
      uniformRepository.save.mockResolvedValue({} as any);

      childRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      emergencyContactRepository.delete.mockResolvedValue({
        affected: 0,
        raw: [],
      });

      historyRepository.save.mockResolvedValue({} as any);

      const result = await service.update('emp-1', updateDto, 'admin');

      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          changedField: 'fullName',
          changedBy: 'admin',
        }),
      );
      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          changedField: 'email',
          changedBy: 'admin',
        }),
      );
      expect(result.fullName).toBe('John Updated');
    });

    it('should throw NotFoundException when employee not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('emp-999', { fullName: 'Ghost' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove an employee', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      employeeRepository.softRemove.mockResolvedValue(mockEmployee);

      await service.remove('emp-1');

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        withDeleted: false,
        relations: {
          status: true,
          supervisor: true,
          department: true,
          educations: true,
          uniforms: true,
          children: true,
          emergencyContacts: true,
          nationalityRef: true,
          placeOfBirthRef: true,
          maritalStatusRef: true,
          genderRef: true,
          bloodTypeRef: true,
        },
      });
      expect(employeeRepository.softRemove).toHaveBeenCalledWith(mockEmployee);
    });

    it('should throw NotFoundException when not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('emp-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeStatus', () => {
    it('should change status and create history', async () => {
      const newStatus: EmployeeStatus = {
        ...mockStatus,
        id: 'status-2',
        name: 'Inactive',
      };
      const empWithStatus = {
        ...mockEmployee,
        status: mockStatus,
      };

      employeeRepository.findOne.mockResolvedValue(empWithStatus);
      statusRepository.findOneBy.mockResolvedValue(newStatus);
      employeeRepository.save.mockResolvedValue({
        ...empWithStatus,
        status: newStatus,
      });
      historyRepository.save.mockResolvedValue({} as any);

      const result = await service.changeStatus(
        'emp-1',
        { statusId: 'status-2', notes: 'Resigned' },
        'admin',
      );

      expect(historyRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          changedField: 'status',
          oldValue: 'Active',
          newValue: 'Inactive',
          notes: 'Resigned',
          changedBy: 'admin',
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when new status not found', async () => {
      employeeRepository.findOne.mockResolvedValue(mockEmployee);
      statusRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.changeStatus('emp-1', { statusId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkChangeStatus', () => {
    it('should change status for multiple employees', async () => {
      const newStatus: EmployeeStatus = {
        ...mockStatus,
        id: 'status-2',
        name: 'Inactive',
      };
      const emp1 = { ...mockEmployee, id: 'emp-1', status: mockStatus };
      const emp2 = { ...mockEmployee, id: 'emp-2', status: mockStatus };

      statusRepository.findOneBy.mockResolvedValue(newStatus);

      employeeRepository.findOne
        .mockResolvedValueOnce(emp1)
        .mockResolvedValueOnce(emp2)
        .mockResolvedValueOnce(null);

      employeeRepository.save.mockResolvedValue({} as any);
      historyRepository.save.mockResolvedValue({} as any);

      const result = await service.bulkChangeStatus(
        { employeeIds: ['emp-1', 'emp-2', 'emp-3'], statusId: 'status-2' },
        'admin',
      );

      expect(result).toEqual({ changed: 2 });
    });

    it('should throw NotFoundException when status not found', async () => {
      statusRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.bulkChangeStatus({
          employeeIds: ['emp-1'],
          statusId: 'invalid',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getHistory', () => {
    it('should return history records ordered by changedAt DESC', async () => {
      const mockHistory = [{ id: 'h-1', changedField: 'fullName' }];
      historyRepository.find.mockResolvedValue(mockHistory as any);

      const result = await service.getHistory('emp-1');

      expect(historyRepository.find).toHaveBeenCalledWith({
        where: { employee: { id: 'emp-1' } },
        order: { changedAt: 'DESC' },
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe('updatePhotoUrl', () => {
    it('should update photoUrl on the employee', async () => {
      employeeRepository.update.mockResolvedValue({
        affected: 1,
        raw: [],
      } as any);

      await service.updatePhotoUrl('emp-1', 'https://example.com/photo.jpg');

      expect(employeeRepository.update).toHaveBeenCalledWith('emp-1', {
        photoUrl: 'https://example.com/photo.jpg',
      });
    });
  });

  describe('restore', () => {
    it('should restore a deleted employee', async () => {
      const deletedEmployee = { ...mockEmployee, deletedAt: new Date() };
      employeeRepository.findOne.mockResolvedValue(deletedEmployee);
      employeeRepository.recover.mockResolvedValue(mockEmployee);

      const result = await service.restore('emp-1');

      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'emp-1' },
        withDeleted: true,
        relations: {
          educations: true,
          uniforms: true,
          children: true,
          emergencyContacts: true,
        },
      });
      expect(employeeRepository.recover).toHaveBeenCalledWith(deletedEmployee);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundException when not found', async () => {
      employeeRepository.findOne.mockResolvedValue(null);

      await expect(service.restore('emp-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return aggregated statistics', async () => {
      employeeRepository.count.mockResolvedValue(50);
      departmentRepository.count.mockResolvedValue(5);
      statusRepository.count.mockResolvedValue(3);
      genderRepository.count.mockResolvedValue(2);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      employeeRepository.createQueryBuilder
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockQueryBuilder)
        .mockReturnValueOnce(mockQueryBuilder);

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          {
            statusId: 's-1',
            statusName: 'Active',
            color: '#green',
            count: '30',
          },
        ])
        .mockResolvedValueOnce([
          { departmentId: 'd-1', departmentName: 'Engineering', count: '20' },
        ])
        .mockResolvedValueOnce([
          { genderId: 'g-1', genderName: 'Male', count: '25' },
        ]);

      employeeRepository.find.mockResolvedValue([mockEmployee]);

      const result = await service.getStats();

      expect(result.totalEmployees).toBe(50);
      expect(result.totalDepartments).toBe(5);
      expect(result.totalStatuses).toBe(3);
      expect(result.totalGenders).toBe(2);
      expect(result.employeesByStatus).toHaveLength(1);
      expect(result.employeesByStatus[0].count).toBe(30);
      expect(result.employeesByDepartment[0].count).toBe(20);
      expect(result.employeesByGender[0].count).toBe(25);
      expect(result.recentEmployees).toHaveLength(1);
    });
  });
});

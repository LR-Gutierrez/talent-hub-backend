import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: bcrypt.hashSync('correct-password', 10),
    displayName: 'Test User',
    photoUrl: null,
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    hashPassword: jest.fn(),
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    it('should return token and user for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.signIn(
        'test@example.com',
        'correct-password',
      );

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user).toEqual({
        userId: mockUser.id,
        userName: mockUser.displayName,
        email: mockUser.email,
        authority: [mockUser.role],
        avatar: null,
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.signIn('unknown@example.com', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.signIn('inactive@example.com', 'correct-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.signIn('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    it('should create user and return token + user', async () => {
      const createdUser = { ...mockUser, displayName: 'New User' };
      usersService.create.mockResolvedValue(createdUser);

      const result = await service.signUp(
        'new@example.com',
        'password123',
        'New User',
      );

      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(result.user).toEqual({
        userId: createdUser.id,
        userName: createdUser.displayName,
        email: createdUser.email,
        authority: [createdUser.role],
        avatar: null,
      });
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      });
    });

    it('should propagate error when email already exists', async () => {
      usersService.create.mockRejectedValue(new Error('Duplicate email'));

      await expect(
        service.signUp('existing@example.com', 'password123'),
      ).rejects.toThrow('Duplicate email');
    });
  });
});

jest.setTimeout(60000);

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth/auth.guard';
import { PoliciesGuard } from '../src/casl/policies.guard';

const mockAuthGuard: CanActivate = {
  canActivate: jest.fn((ctx) => {
    const req = ctx.switchToHttp().getRequest();
    req.user = {
      userId: 'test-user-id',
      userName: 'Admin',
      email: 'admin@local.com',
      role: 'admin',
      authority: ['admin'],
    };
    return true;
  }),
};

const mockPoliciesGuard: CanActivate = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('Employees (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let statusId: string;
  let employeeId: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:17-alpine')
      .withDatabase('talent_hub_test')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();

    process.env.DB_HOST = container.getHost();
    process.env.DB_PORT = String(container.getMappedPort(5432));
    process.env.DB_USERNAME = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.DB_DATABASE = 'talent_hub_test';
    process.env.DB_SYNCHRONIZE = 'true';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PoliciesGuard)
      .useValue(mockPoliciesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('POST /api/employee-statuses should create a status for testing', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/employee-statuses')
      .send({ name: 'E2E Active', color: '#00ff00' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    statusId = res.body.id;
  });

  it('POST /api/employees should create an employee', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/employees')
      .send({ fullName: 'John E2E', statusId, isActive: true })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.fullName).toBe('John E2E');
    expect(res.body.statusId).toBe(statusId);
    employeeId = res.body.id;
  });

  it('GET /api/employees should list employees', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/employees')
      .expect(200);

    expect(res.body).toHaveProperty('list');
    expect(res.body).toHaveProperty('total');
    expect(res.body.list.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/employees?statusId= should filter by status', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/employees?statusId=${statusId}`)
      .expect(200);

    expect(res.body.list.every((e: any) => e.statusId === statusId)).toBe(true);
  });

  it('GET /api/employees/:id should return an employee', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/employees/${employeeId}`)
      .expect(200);

    expect(res.body.id).toBe(employeeId);
    expect(res.body.fullName).toBe('John E2E');
  });

  it('GET /api/employees/:id/history should return history', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/employees/${employeeId}/history`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PATCH /api/employees/:id should update an employee', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/employees/${employeeId}`)
      .send({ position: 'Senior Engineer' })
      .expect(200);

    expect(res.body.position).toBe('Senior Engineer');
  });

  it('PATCH /api/employees/:id/status should change employee status', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/employees/${employeeId}/status`)
      .send({ statusId })
      .expect(200);

    expect(res.body.statusId).toBe(statusId);
  });

  it('DELETE /api/employees/:id should soft-delete an employee', async () => {
    await request(app.getHttpServer())
      .delete(`/api/employees/${employeeId}`)
      .expect(200);
  });

  it('GET /api/employees/:id with deleted should not find it', async () => {
    await request(app.getHttpServer())
      .get(`/api/employees/${employeeId}`)
      .expect(404);
  });

  it('GET /api/employees?withDeleted=true should include deleted', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/employees?withDeleted=true`)
      .expect(200);

    const found = res.body.list.find((e: any) => e.id === employeeId);
    expect(found).toBeDefined();
    expect(found.deletedAt).toBeTruthy();
  });

  it('PATCH /api/employees/:id/restore should restore a deleted employee', async () => {
    await request(app.getHttpServer())
      .patch(`/api/employees/${employeeId}/restore`)
      .expect(200);
  });

  it('GET /api/employees/stats should return stats', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/employees/stats')
      .expect(200);

    expect(res.body).toHaveProperty('totalEmployees');
  });

  it('GET /api/employees/:id should return 404 for unknown id', async () => {
    await request(app.getHttpServer())
      .get('/api/employees/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});

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

describe('ExportImport (e2e)', () => {
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

  beforeAll(async () => {
    const statusRes = await request(app.getHttpServer())
      .post('/api/employee-statuses')
      .send({ name: 'Export Active', color: '#00ff00' })
      .expect(201);
    statusId = statusRes.body.id;

    const empRes = await request(app.getHttpServer())
      .post('/api/employees')
      .send({ fullName: 'Export E2E User', statusId, isActive: true })
      .expect(201);
    employeeId = empRes.body.id;
  });

  it('GET /api/employees/export/excel should return an Excel file', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/employees/export/excel')
      .expect(200);
    expect(res.headers['content-type']).toMatch(
      /vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/,
    );
    expect(res.headers['content-disposition']).toContain(
      'TalentHub_Employee_Directory.xlsx',
    );
    expect(res.body instanceof Buffer || typeof res.body === 'object').toBe(
      true,
    );
  });

  it('GET /api/employees/import/template should return an Excel template', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/employees/import/template')
      .expect(200);
    expect(res.headers['content-type']).toMatch(
      /vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/,
    );
    expect(res.headers['content-disposition']).toContain(
      'employees_import_template.xlsx',
    );
  });

  it('POST /api/employees/import/excel should reject non-Excel file', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/employees/import/excel')
      .attach('file', Buffer.from('not an excel file'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('POST /api/employees/import/preview should reject non-Excel file', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/employees/import/preview')
      .attach('file', Buffer.from('not an excel file'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

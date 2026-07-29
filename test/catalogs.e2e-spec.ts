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

describe('Catalogs (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let genderId: string;

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

  describe('Genders', () => {
    it('POST /api/genders should create a gender', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/genders')
        .send({ name: 'Non-Binary', value: 'non-binary', sortOrder: 1 })
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Non-Binary');
      genderId = res.body.id;
    });

    it('GET /api/genders should list genders', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/genders')
        .expect(200);
      expect(res.body).toHaveProperty('list');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.list)).toBe(true);
    });

    it('GET /api/genders?query=Non-Binary should filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/genders?query=Non-Binary')
        .expect(200);
      expect(res.body.list.length).toBeGreaterThanOrEqual(1);
      expect(
        res.body.list.every((g: any) => g.name.includes('Non-Binary')),
      ).toBe(true);
    });

    it('GET /api/genders/:id should return a gender', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/genders/${genderId}`)
        .expect(200);
      expect(res.body.id).toBe(genderId);
      expect(res.body.name).toBe('Non-Binary');
    });

    it('PATCH /api/genders/:id should update a gender', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/genders/${genderId}`)
        .send({ sortOrder: 5 })
        .expect(200);
      expect(res.body.sortOrder).toBe(5);
    });

    it('DELETE /api/genders/:id should soft-delete a gender', async () => {
      await request(app.getHttpServer())
        .delete(`/api/genders/${genderId}`)
        .expect(200);
    });

    it('GET /api/genders/:id with deleted should return 404', async () => {
      await request(app.getHttpServer())
        .get(`/api/genders/${genderId}`)
        .expect(404);
    });

    it('GET /api/genders?withDeleted=true should include deleted', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/genders?withDeleted=true')
        .expect(200);
      const found = res.body.list.find((g: any) => g.id === genderId);
      expect(found).toBeDefined();
      expect(found.deletedAt).toBeTruthy();
    });

    it('PATCH /api/genders/:id/restore should restore a deleted gender', async () => {
      await request(app.getHttpServer())
        .patch(`/api/genders/${genderId}/restore`)
        .expect(200);
    });

    it('GET /api/genders/:id should return 404 for unknown id', async () => {
      await request(app.getHttpServer())
        .get('/api/genders/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});

jest.setTimeout(60000);

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;

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
    process.env.JWT_SECRET = 'test-secret-key-for-e2e';
    process.env.CORS_ORIGIN = '*';
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await container.stop();
  });

  describe('Health', () => {
    it('GET /api/health should return ok', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('GET /api/nonexistent should return 404', async () => {
      await request(app.getHttpServer()).get('/api/nonexistent').expect(404);
    });
  });

  describe('Auth', () => {
    it('POST /api/auth/sign-in should return user and set token cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({ email: 'admin@local.com', password: '123Qwe' })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'admin@local.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('POST /api/auth/sign-in with wrong password should return 401', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({ email: 'admin@local.com', password: 'wrong' })
        .expect(401);
    });

    it('POST /api/auth/sign-up should create user and return token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-up')
        .send({
          email: 'e2e-newuser@test.com',
          password: 'password123',
          displayName: 'E2E User',
        })
        .expect(201);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('e2e-newuser@test.com');
      expect(res.body.user.userName).toBe('E2E User');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('POST /api/auth/sign-up with existing email should return error', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/sign-up')
        .send({ email: 'admin@local.com', password: 'password123' })
        .expect(500);
    });

    it('POST /api/auth/sign-in with new user credentials should succeed', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/sign-in')
        .send({ email: 'e2e-newuser@test.com', password: 'password123' })
        .expect(201);

      expect(res.body.user.email).toBe('e2e-newuser@test.com');
    });

    it('GET /api/auth/me without token should return 401', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });
});

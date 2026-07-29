import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: dataSource }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('check', () => {
    it('should return status ok when DB responds', async () => {
      dataSource.query.mockResolvedValue([{ '1': 1 }]);

      const result = await controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('should throw when DB fails', async () => {
      dataSource.query.mockRejectedValue(new Error('DB connection failed'));

      await expect(controller.check()).rejects.toThrow('DB connection failed');
    });
  });
});

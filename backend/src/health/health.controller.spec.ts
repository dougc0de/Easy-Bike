import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getHealth: jest.fn().mockReturnValue({ status: 'ok' }),
            getDatabaseStatus: jest.fn().mockReturnValue({ status: 'not_configured' }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return service health info', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok' });
  });

  it('should return database status info', () => {
    expect(controller.getDatabaseStatus()).toEqual({ status: 'not_configured' });
  });
});

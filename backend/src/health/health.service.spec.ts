import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose a healthy service status', () => {
    expect(service.getHealth().status).toBe('ok');
  });

  it('should expose database bootstrap status', () => {
    expect(service.getDatabaseStatus().provider).toBe('supabase-postgres');
  });
});

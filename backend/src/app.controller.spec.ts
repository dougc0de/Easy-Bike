import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return project bootstrap info', () => {
      expect(appController.getRoot()).toEqual({
        name: 'Easy Bike API',
        status: 'bootstrap',
        message: 'Backend base listo para integracion con frontend y modulos de negocio.',
        docs: {
          health: '/health',
          database: '/health/db',
        },
      });
    });
  });
});

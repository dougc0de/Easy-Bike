import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootInfo() {
    return {
      name: 'Easy Bike API',
      status: 'bootstrap',
      message: 'Backend base listo para integracion con frontend y modulos de negocio.',
      docs: {
        health: '/health',
        database: '/health/db',
      },
    };
  }
}

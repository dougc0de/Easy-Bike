import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootInfo() {
    return {
      name: 'Easy Bike API',
      status: 'ok',
      message: 'Backend formal listo para modulos de negocio, DTOs y futura integracion con Supabase.',
      docs: {
        salud: '/salud',
        baseDatos: '/salud/base-datos',
      },
    };
  }
}

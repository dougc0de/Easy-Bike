import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootInfo() {
    return {
      name: 'Easy Bike API',
      status: 'ok',
      message: 'API operativa para autenticación, catálogo, reservas, contactos y administración.',
      docs: {
        salud: '/salud',
        baseDatos: '/salud/base-datos',
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../base-datos/base-datos.service';

@Injectable()
export class SaludService {
  constructor(private readonly baseDatosService: BaseDatosService) {}

  obtenerEstadoGeneral() {
    return {
      status: 'ok',
      service: 'easy-bike-backend',
      timestamp: new Date().toISOString(),
      mode: this.baseDatosService.obtenerModo(),
    };
  }

  obtenerEstadoBaseDatos() {
    const modo = this.baseDatosService.obtenerModo();
    const configurada = this.baseDatosService.estaConfigurada();
    const inicializada = this.baseDatosService.estaInicializada();

    return {
      status:
        modo === 'memoria'
          ? 'memoria'
          : configurada && inicializada
            ? 'conectada'
            : configurada
              ? 'pendiente'
              : 'no-configurada',
      mode: modo,
      provider: 'supabase-postgres',
      configured: configurada,
      connected: inicializada,
      message:
        modo === 'memoria'
          ? 'La aplicación corre con persistencia en memoria. TypeORM queda listo para activarse con Supabase.'
          : configurada
            ? 'TypeORM está configurado para PostgreSQL/Supabase. Verifica tablas y credenciales finales.'
            : 'Falta completar DATABASE_URL para habilitar la conexión TypeORM con Supabase.',
    };
  }
}

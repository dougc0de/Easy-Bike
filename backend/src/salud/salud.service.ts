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
    const tipoConexion = this.baseDatosService.obtenerTipoConexionConfigurada();

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
      connectionType: tipoConexion,
      configured: configurada,
      connected: inicializada,
      message:
        modo === 'memoria'
          ? 'La aplicación corre con persistencia en memoria. TypeORM queda listo para activarse con Supabase.'
          : configurada
            ? tipoConexion === 'pooler'
              ? 'TypeORM está configurado con Supabase usando la conexión pooler, ideal para despliegues como Render.'
              : 'TypeORM está configurado para PostgreSQL/Supabase con conexión directa. Si Render falla por red, usa DATABASE_URL_POOLER.'
            : 'Falta completar DATABASE_URL o DATABASE_URL_POOLER para habilitar la conexión TypeORM con Supabase.',
    };
  }
}

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
    const configurada = this.baseDatosService.estaConfigurada();
    const inicializada = this.baseDatosService.estaInicializada();
    const tipoConexion = this.baseDatosService.obtenerTipoConexionConfigurada();

    return {
      status: configurada && inicializada ? 'conectada' : configurada ? 'pendiente' : 'no-configurada',
      mode: this.baseDatosService.obtenerModo(),
      provider: 'supabase-postgres',
      connectionType: tipoConexion,
      configured: configurada,
      connected: inicializada,
      message:
        configurada
          ? tipoConexion === 'pooler'
            ? 'TypeORM está conectado a Supabase usando la conexión pooler.'
            : 'TypeORM está configurado para PostgreSQL/Supabase con conexión directa.'
          : 'Falta completar DATABASE_URL o DATABASE_URL_POOLER para habilitar la conexión TypeORM con Supabase.',
    };
  }
}

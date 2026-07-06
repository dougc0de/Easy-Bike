import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BicicletaEntidad } from './entidades/bicicleta.entidad';
import { ConfiguracionUbicacionEntidad } from './entidades/configuracion-ubicacion.entidad';
import { MensajeContactoEntidad } from './entidades/mensaje-contacto.entidad';
import { ReservaEntidad } from './entidades/reserva.entidad';
import { UsuarioEntidad } from './entidades/usuario.entidad';
import {
  esProduccion,
  obtenerBanderaBooleana,
  obtenerConfiguracionConexionBaseDatos,
} from '../comun/utilidades/entorno.util';

export function crearOpcionesTypeOrm(configService: ConfigService): TypeOrmModuleOptions {
  const { url: databaseUrl } = obtenerConfiguracionConexionBaseDatos();

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL o DATABASE_URL_POOLER es obligatoria para conectar Easy Bike con Supabase PostgreSQL.',
    );
  }

  const sslActivo = obtenerBanderaBooleana(configService.get<string>('DB_SSL'), true);

  return {
    type: 'postgres',
    url: databaseUrl,
    ssl: sslActivo ? { rejectUnauthorized: false } : false,
    entities: [
      UsuarioEntidad,
      BicicletaEntidad,
      ReservaEntidad,
      MensajeContactoEntidad,
      ConfiguracionUbicacionEntidad,
    ],
    synchronize: false,
    autoLoadEntities: false,
    logging: false,
    retryAttempts: esProduccion() ? 0 : 2,
    retryDelay: 1000,
    extra: {
      max: 5,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
      keepAlive: true,
    },
  };
}

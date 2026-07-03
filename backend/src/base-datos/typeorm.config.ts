import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BicicletaEntidad } from './entidades/bicicleta.entidad';
import { ConfiguracionUbicacionEntidad } from './entidades/configuracion-ubicacion.entidad';
import { MensajeContactoEntidad } from './entidades/mensaje-contacto.entidad';
import { ReservaEntidad } from './entidades/reserva.entidad';
import { UsuarioEntidad } from './entidades/usuario.entidad';
import { obtenerBanderaBooleana } from '../comun/utilidades/entorno.util';

export function crearOpcionesTypeOrm(configService: ConfigService): TypeOrmModuleOptions {
  const databaseUrlPooler = configService.get<string>('DATABASE_URL_POOLER')?.trim();
  const databaseUrlDirecta = configService.get<string>('DATABASE_URL')?.trim();
  const databaseUrl = databaseUrlPooler || databaseUrlDirecta;

  if (!databaseUrl) {
    throw new Error(
      'MODO_DATOS=typeorm requiere DATABASE_URL o DATABASE_URL_POOLER configurada para conectar con Supabase PostgreSQL.',
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
  };
}

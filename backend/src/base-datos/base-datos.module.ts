import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  obtenerConfiguracionConexionBaseDatos,
  obtenerModoDatos,
} from '../comun/utilidades/entorno.util';
import { BaseDatosService } from './base-datos.service';
import { InicializacionDatosService } from './inicializacion-datos.service';
import { crearOpcionesTypeOrm } from './typeorm.config';

@Global()
@Module({})
export class BaseDatosModule {
  static registrar(): DynamicModule {
    const modo = obtenerModoDatos();
    const conexionBaseDatos = obtenerConfiguracionConexionBaseDatos();

    if (modo === 'typeorm' && !conexionBaseDatos.url) {
      throw new Error(
        'MODO_DATOS=typeorm requiere DATABASE_URL o DATABASE_URL_POOLER. Completa la conexión con Supabase antes de iniciar.',
      );
    }

    return {
      module: BaseDatosModule,
      imports:
        modo === 'typeorm'
          ? [
              TypeOrmModule.forRootAsync({
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => crearOpcionesTypeOrm(configService),
              }),
            ]
          : [],
      providers: [BaseDatosService, InicializacionDatosService],
      exports: [BaseDatosService],
    };
  }
}

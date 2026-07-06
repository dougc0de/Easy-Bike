import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { obtenerConfiguracionConexionBaseDatos } from '../comun/utilidades/entorno.util';
import { BaseDatosService } from './base-datos.service';
import { InicializacionDatosService } from './inicializacion-datos.service';
import { crearOpcionesTypeOrm } from './typeorm.config';

@Global()
@Module({})
export class BaseDatosModule {
  static registrar(): DynamicModule {
    const conexionBaseDatos = obtenerConfiguracionConexionBaseDatos();

    if (!conexionBaseDatos.url) {
      throw new Error(
        'Easy Bike requiere DATABASE_URL o DATABASE_URL_POOLER para iniciar la conexión con Supabase PostgreSQL.',
      );
    }

    return {
      module: BaseDatosModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => crearOpcionesTypeOrm(configService),
        }),
      ],
      providers: [BaseDatosService, InicializacionDatosService],
      exports: [BaseDatosService],
    };
  }
}

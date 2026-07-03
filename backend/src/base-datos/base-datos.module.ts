import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';
import { BaseDatosService } from './base-datos.service';
import { crearOpcionesTypeOrm } from './typeorm.config';

@Global()
@Module({})
export class BaseDatosModule {
  static registrar(): DynamicModule {
    const modo = obtenerModoDatos();

    if (modo === 'typeorm' && !process.env.DATABASE_URL?.trim()) {
      throw new Error(
        'MODO_DATOS=typeorm requiere DATABASE_URL. Completa la conexión con Supabase antes de iniciar.',
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
      providers: [BaseDatosService],
      exports: [BaseDatosService],
    };
  }
}

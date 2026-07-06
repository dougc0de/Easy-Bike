import { Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  obtenerConfiguracionConexionBaseDatos,
  obtenerModoDatos,
} from '../comun/utilidades/entorno.util';

@Injectable()
export class BaseDatosService {
  constructor(@Optional() @InjectDataSource() private readonly dataSource?: DataSource) {}

  obtenerModo() {
    return obtenerModoDatos();
  }

  estaConfigurada(): boolean {
    return Boolean(obtenerConfiguracionConexionBaseDatos().url);
  }

  obtenerTipoConexionConfigurada(): 'pooler' | 'directa' | 'ninguna' {
    return obtenerConfiguracionConexionBaseDatos().tipoConexion;
  }

  estaInicializada(): boolean {
    return Boolean(this.dataSource?.isInitialized);
  }

  obtenerDataSource(): DataSource {
    if (!this.dataSource) {
      throw new ServiceUnavailableException(
        'El DataSource de TypeORM no está disponible. Verifica la conexión DATABASE_URL o DATABASE_URL_POOLER.',
      );
    }

    return this.dataSource;
  }
}

import { Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';

@Injectable()
export class BaseDatosService {
  constructor(@Optional() @InjectDataSource() private readonly dataSource?: DataSource) {}

  obtenerModo() {
    return obtenerModoDatos();
  }

  estaConfigurada(): boolean {
    return Boolean(process.env.DATABASE_URL_POOLER?.trim() || process.env.DATABASE_URL?.trim());
  }

  obtenerTipoConexionConfigurada(): 'pooler' | 'directa' | 'ninguna' {
    if (process.env.DATABASE_URL_POOLER?.trim()) {
      return 'pooler';
    }

    if (process.env.DATABASE_URL?.trim()) {
      return 'directa';
    }

    return 'ninguna';
  }

  estaInicializada(): boolean {
    return Boolean(this.dataSource?.isInitialized);
  }

  obtenerDataSource(): DataSource {
    if (!this.dataSource) {
      throw new ServiceUnavailableException(
        'El DataSource de TypeORM no está disponible. Verifica MODO_DATOS y la conexión DATABASE_URL o DATABASE_URL_POOLER.',
      );
    }

    return this.dataSource;
  }
}

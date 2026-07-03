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
    return Boolean(process.env.DATABASE_URL?.trim());
  }

  estaInicializada(): boolean {
    return Boolean(this.dataSource?.isInitialized);
  }

  obtenerDataSource(): DataSource {
    if (!this.dataSource) {
      throw new ServiceUnavailableException(
        'El DataSource de TypeORM no está disponible. Verifica MODO_DATOS y DATABASE_URL.',
      );
    }

    return this.dataSource;
  }
}

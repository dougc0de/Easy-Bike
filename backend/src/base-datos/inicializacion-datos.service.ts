import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BaseDatosService } from './base-datos.service';

@Injectable()
export class InicializacionDatosService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InicializacionDatosService.name);

  constructor(private readonly baseDatosService: BaseDatosService) {}

  async onApplicationBootstrap() {
    if (!this.baseDatosService.estaInicializada()) {
      return;
    }

    await this.normalizarEsquemaUsuariosLegado();
    await this.normalizarEsquemaReservasLegado();
    await this.normalizarEsquemaUbicacionesLegado();

    this.logger.log('Compatibilidad de esquema verificada sin sembrar datos operativos.');
  }

  private async normalizarEsquemaUsuariosLegado() {
    const dataSource = this.baseDatosService.obtenerDataSource();

    await dataSource.query(`
      alter table if exists public.usuarios
      add column if not exists password_hash text;
    `);

    await dataSource.query(`
      alter table if exists public.usuarios
      add column if not exists refresh_token_hash text;
    `);

    await dataSource.query(`
      alter table if exists public.usuarios
      add column if not exists activo boolean not null default true;
    `);

    await dataSource.query(`
      alter table if exists public.usuarios
      add column if not exists ultimo_acceso_at timestamptz;
    `);
  }

  private async normalizarEsquemaReservasLegado() {
    const dataSource = this.baseDatosService.obtenerDataSource();

    await dataSource.query(`
      alter table if exists public.reservas
      alter column telefono_cliente drop not null;
    `);
  }

  private async normalizarEsquemaUbicacionesLegado() {
    const dataSource = this.baseDatosService.obtenerDataSource();

    await dataSource.query(`
      alter table if exists public.configuraciones_ubicacion
      add column if not exists contact_phone varchar(40) not null default '';
    `);

    await dataSource.query(`
      alter table if exists public.configuraciones_ubicacion
      add column if not exists contact_email varchar(180) not null default '';
    `);

    await dataSource.query(`
      update public.configuraciones_ubicacion
      set contact_phone = ''
      where contact_phone is null;
    `);

    await dataSource.query(`
      update public.configuraciones_ubicacion
      set contact_email = ''
      where contact_email is null;
    `);
  }
}

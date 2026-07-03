import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { BicicletaEntidad } from './entidades/bicicleta.entidad';
import { ConfiguracionUbicacionEntidad } from './entidades/configuracion-ubicacion.entidad';
import { ReservaEntidad } from './entidades/reserva.entidad';
import { UsuarioEntidad } from './entidades/usuario.entidad';
import { BaseDatosService } from './base-datos.service';
import { Repository } from 'typeorm';
import {
  BICICLETAS_SEMILLA,
  RESERVAS_SEMILLA,
  UBICACIONES_SEMILLA,
  USUARIOS_SEMILLA,
} from '../comun/datos/semillas';

@Injectable()
export class InicializacionDatosService implements OnApplicationBootstrap {
  private readonly logger = new Logger(InicializacionDatosService.name);

  constructor(private readonly baseDatosService: BaseDatosService) {}

  async onApplicationBootstrap() {
    if (this.baseDatosService.obtenerModo() !== 'typeorm' || !this.baseDatosService.estaInicializada()) {
      return;
    }

    const dataSource = this.baseDatosService.obtenerDataSource();

    await this.normalizarEsquemaUsuariosLegado();
    await this.sembrarUsuarios(dataSource.getRepository(UsuarioEntidad));
    await this.sembrarBicicletas(dataSource.getRepository(BicicletaEntidad));
    await this.sembrarReservas(dataSource.getRepository(ReservaEntidad));
    await this.sembrarUbicaciones(dataSource.getRepository(ConfiguracionUbicacionEntidad));
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

  private async sembrarUsuarios(repositorio: Repository<UsuarioEntidad>) {
    const total = await repositorio.count();

    if (total > 0) return;

    await repositorio.save(
      repositorio.create(
        USUARIOS_SEMILLA.map((usuario) => ({
          id: usuario.id,
          email: usuario.email,
          nombreCompleto: usuario.nombreCompleto,
          rol: usuario.rol,
          telefono: usuario.telefono ?? null,
          passwordHash: usuario.passwordHash ?? null,
          refreshTokenHash: usuario.refreshTokenHash ?? null,
          activo: usuario.activo,
          ultimoAccesoAt: usuario.ultimoAccesoAt ? new Date(usuario.ultimoAccesoAt) : null,
          createdAt: new Date(usuario.createdAt),
          updatedAt: new Date(usuario.updatedAt),
        })),
      ),
    );

    this.logger.log(`Se sembraron ${USUARIOS_SEMILLA.length} usuarios iniciales en TypeORM.`);
  }

  private async sembrarBicicletas(repositorio: Repository<BicicletaEntidad>) {
    const total = await repositorio.count();

    if (total > 0) return;

    await repositorio.save(
      repositorio.create(
        BICICLETAS_SEMILLA.map((bicicleta) => ({
          id: bicicleta.id,
          nombre: bicicleta.nombre,
          categoria: bicicleta.categoria,
          descripcionCorta: bicicleta.descripcionCorta,
          detalle: bicicleta.detalle,
          precio: bicicleta.precio,
          autonomia: bicicleta.autonomia,
          disponibilidad: bicicleta.disponibilidad,
          colorAcento: bicicleta.colorAcento,
          recomendadoPara: bicicleta.recomendadoPara,
          urlImagen: bicicleta.urlImagen,
          textoAlternativoImagen: bicicleta.textoAlternativoImagen,
          activo: bicicleta.activo,
          createdAt: new Date(bicicleta.createdAt),
          updatedAt: new Date(bicicleta.updatedAt),
        })),
      ),
    );

    this.logger.log(`Se sembraron ${BICICLETAS_SEMILLA.length} bicicletas iniciales en TypeORM.`);
  }

  private async sembrarReservas(repositorio: Repository<ReservaEntidad>) {
    const total = await repositorio.count();

    if (total > 0) return;

    await repositorio.save(
      repositorio.create(
        RESERVAS_SEMILLA.map((reserva) => ({
          id: reserva.id,
          nombreCliente: reserva.nombreCliente,
          correoCliente: reserva.correoCliente,
          telefonoCliente: reserva.telefonoCliente,
          bicicletaId: reserva.bicicletaId,
          nombreBicicleta: reserva.nombreBicicleta,
          fechaReserva: reserva.fechaReserva,
          horaReserva: reserva.horaReserva,
          duracionHoras: reserva.duracionHoras,
          puntoRecojo: reserva.puntoRecojo,
          notas: reserva.notas,
          monto: reserva.monto,
          estado: reserva.estado,
          codigoVoucher: reserva.codigoVoucher,
          metodoPago: reserva.metodoPago,
          origen: reserva.origen,
          atendidaPorUsuarioId: reserva.atendidaPorUsuarioId,
          createdAt: new Date(reserva.createdAt),
          updatedAt: new Date(reserva.updatedAt),
        })),
      ),
    );

    this.logger.log(`Se sembraron ${RESERVAS_SEMILLA.length} reservas iniciales en TypeORM.`);
  }

  private async sembrarUbicaciones(repositorio: Repository<ConfiguracionUbicacionEntidad>) {
    const total = await repositorio.count();

    if (total > 0) return;

    await repositorio.save(
      repositorio.create(
        UBICACIONES_SEMILLA.map((ubicacion) => ({
          id: ubicacion.id,
          titulo: ubicacion.titulo,
          subtitulo: ubicacion.subtitulo,
          direccion: ubicacion.direccion,
          horario: ubicacion.horario,
          etiquetaCta: ubicacion.etiquetaCta,
          urlExterna: ubicacion.urlExterna,
          urlImagen: ubicacion.urlImagen ?? null,
          urlEmbed: ubicacion.urlEmbed ?? null,
          createdAt: new Date(ubicacion.createdAt),
          updatedAt: new Date(ubicacion.updatedAt),
        })),
      ),
    );

    this.logger.log(`Se sembraron ${UBICACIONES_SEMILLA.length} configuraciones de ubicación en TypeORM.`);
  }
}

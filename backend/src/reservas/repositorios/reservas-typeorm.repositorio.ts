import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';
import { ReservaEntidad } from '../../base-datos/entidades/reserva.entidad';
import { ListarReservasQueryDto } from '../dto/listar-reservas.query.dto';
import { Reserva } from '../interfaces/reserva.interface';
import { RepositorioReservas } from './reservas.repositorio';

@Injectable()
export class ReservasTypeormRepositorio implements RepositorioReservas {
  constructor(private readonly baseDatosService: BaseDatosService) {}

  private get repositorio() {
    return this.baseDatosService.obtenerDataSource().getRepository(ReservaEntidad);
  }

  private mapearEntidad(entidad: ReservaEntidad): Reserva {
    return {
      id: entidad.id,
      nombreCliente: entidad.nombreCliente,
      correoCliente: entidad.correoCliente,
      telefonoCliente: entidad.telefonoCliente,
      bicicletaId: entidad.bicicletaId,
      nombreBicicleta: entidad.nombreBicicleta,
      fechaReserva: entidad.fechaReserva,
      horaReserva: entidad.horaReserva,
      duracionHoras: entidad.duracionHoras,
      puntoRecojo: entidad.puntoRecojo,
      notas: entidad.notas,
      monto: Number(entidad.monto),
      estado: entidad.estado as Reserva['estado'],
      codigoVoucher: entidad.codigoVoucher,
      metodoPago: entidad.metodoPago as Reserva['metodoPago'],
      origen: entidad.origen as Reserva['origen'],
      atendidaPorUsuarioId: entidad.atendidaPorUsuarioId,
      createdAt: entidad.createdAt.toISOString(),
      updatedAt: entidad.updatedAt.toISOString(),
    };
  }

  async listar(query: ListarReservasQueryDto): Promise<Reserva[]> {
    const qb = this.repositorio.createQueryBuilder('reserva');

    if (query.correoCliente) {
      qb.andWhere('LOWER(reserva.correo_cliente) = LOWER(:correoCliente)', {
        correoCliente: query.correoCliente.trim(),
      });
    }

    if (query.bicicletaId) {
      qb.andWhere('reserva.bicicleta_id = :bicicletaId', { bicicletaId: query.bicicletaId });
    }

    if (query.estado) {
      qb.andWhere('reserva.estado = :estado', { estado: query.estado });
    }

    if (query.origen) {
      qb.andWhere('reserva.origen = :origen', { origen: query.origen });
    }

    qb.orderBy('reserva.created_at', 'DESC');
    qb.skip(query.offset ?? 0);
    qb.take(query.limit ?? 50);

    const entidades = await qb.getMany();

    return entidades.map((entidad) => this.mapearEntidad(entidad));
  }

  async obtenerPorId(id: string): Promise<Reserva | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async crear(reserva: Reserva): Promise<Reserva> {
    const entidad = this.repositorio.create({
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
    });

    const guardada = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardada);
  }

  async actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    if (!entidad) {
      return null;
    }

    entidad.nombreCliente = cambios.nombreCliente ?? entidad.nombreCliente;
    entidad.correoCliente = cambios.correoCliente ?? entidad.correoCliente;
    entidad.telefonoCliente =
      cambios.telefonoCliente === undefined ? entidad.telefonoCliente : cambios.telefonoCliente;
    entidad.bicicletaId = cambios.bicicletaId ?? entidad.bicicletaId;
    entidad.nombreBicicleta = cambios.nombreBicicleta ?? entidad.nombreBicicleta;
    entidad.fechaReserva = cambios.fechaReserva ?? entidad.fechaReserva;
    entidad.horaReserva = cambios.horaReserva ?? entidad.horaReserva;
    entidad.duracionHoras = cambios.duracionHoras ?? entidad.duracionHoras;
    entidad.puntoRecojo = cambios.puntoRecojo ?? entidad.puntoRecojo;
    entidad.notas = cambios.notas === undefined ? entidad.notas : cambios.notas;
    entidad.monto = cambios.monto ?? entidad.monto;
    entidad.estado = cambios.estado ?? entidad.estado;
    entidad.codigoVoucher = cambios.codigoVoucher ?? entidad.codigoVoucher;
    entidad.metodoPago = cambios.metodoPago ?? entidad.metodoPago;
    entidad.origen = cambios.origen ?? entidad.origen;
    entidad.atendidaPorUsuarioId =
      cambios.atendidaPorUsuarioId === undefined
        ? entidad.atendidaPorUsuarioId
        : cambios.atendidaPorUsuarioId;
    entidad.updatedAt = new Date(cambios.updatedAt ?? new Date().toISOString());

    const guardada = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardada);
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await this.repositorio.delete({ id });

    return Boolean(resultado.affected);
  }
}

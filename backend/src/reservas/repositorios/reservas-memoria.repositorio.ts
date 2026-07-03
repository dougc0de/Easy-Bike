import { Injectable } from '@nestjs/common';
import { RESERVAS_SEMILLA } from '../../comun/datos/semillas';
import { clonarProfundo } from '../../comun/utilidades/clonacion.util';
import { aplicarPaginacion } from '../../comun/utilidades/paginacion.util';
import { ListarReservasQueryDto } from '../dto/listar-reservas.query.dto';
import { Reserva } from '../interfaces/reserva.interface';
import { RepositorioReservas } from './reservas.repositorio';

@Injectable()
export class ReservasMemoriaRepositorio implements RepositorioReservas {
  private readonly reservas: Reserva[] = clonarProfundo(RESERVAS_SEMILLA);

  async listar(query: ListarReservasQueryDto): Promise<Reserva[]> {
    const correo = query.correoCliente?.trim().toLowerCase();

    const filtradas = this.reservas.filter((reserva) => {
      if (correo && reserva.correoCliente.toLowerCase() !== correo) return false;
      if (query.bicicletaId && reserva.bicicletaId !== query.bicicletaId) return false;
      if (query.estado && reserva.estado !== query.estado) return false;
      if (query.origen && reserva.origen !== query.origen) return false;

      return true;
    });

    const ordenadas = filtradas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return aplicarPaginacion(ordenadas, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<Reserva | null> {
    return this.reservas.find((reserva) => reserva.id === id) ?? null;
  }

  async crear(reserva: Reserva): Promise<Reserva> {
    this.reservas.push(reserva);

    return reserva;
  }

  async actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva | null> {
    const indice = this.reservas.findIndex((reserva) => reserva.id === id);

    if (indice === -1) {
      return null;
    }

    const actualizada = {
      ...this.reservas[indice],
      ...cambios,
    };

    this.reservas[indice] = actualizada;

    return actualizada;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.reservas.findIndex((reserva) => reserva.id === id);

    if (indice === -1) {
      return false;
    }

    this.reservas.splice(indice, 1);

    return true;
  }
}

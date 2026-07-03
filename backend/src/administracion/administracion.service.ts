import { Injectable } from '@nestjs/common';
import { DisponibilidadBicicleta } from '../comun/enums/disponibilidad-bicicleta.enum';
import { EstadoReserva } from '../comun/enums/estado-reserva.enum';
import { BicicletasService } from '../bicicletas/bicicletas.service';
import { ActualizarBicicletaDto } from '../bicicletas/dto/actualizar-bicicleta.dto';
import { CrearReservaTiendaDto } from '../reservas/dto/crear-reserva-tienda.dto';
import { ListarReservasQueryDto } from '../reservas/dto/listar-reservas.query.dto';
import { ReservasService } from '../reservas/reservas.service';
import { DisponibilidadPorCategoria } from './interfaces/disponibilidad-por-categoria.interface';
import { ResumenAdministrativo } from './interfaces/resumen-administrativo.interface';

@Injectable()
export class AdministracionService {
  constructor(
    private readonly bicicletasService: BicicletasService,
    private readonly reservasService: ReservasService,
  ) {}

  async obtenerResumen(): Promise<ResumenAdministrativo> {
    const [bicicletas, reservas] = await Promise.all([
      this.bicicletasService.listar({ limit: 1000, offset: 0 }),
      this.reservasService.listar({ limit: 1000, offset: 0 }),
    ]);

    return {
      totalBicicletas: bicicletas.length,
      bicicletasListas: bicicletas.filter(
        (bicicleta) => bicicleta.disponibilidad === DisponibilidadBicicleta.DISPONIBLE,
      ).length,
      entregasPendientes: reservas.filter(
        (reserva) => reserva.estado === EstadoReserva.PENDIENTE_DE_ENTREGA,
      ).length,
      montoAcumulado: reservas.reduce((total, reserva) => total + reserva.monto, 0),
      reservasRegistradas: reservas.length,
    };
  }

  async obtenerDisponibilidadPorCategoria(): Promise<DisponibilidadPorCategoria[]> {
    const bicicletas = await this.bicicletasService.listar({ limit: 1000, offset: 0 });
    const agrupadas = new Map<string, DisponibilidadPorCategoria>();

    for (const bicicleta of bicicletas) {
      const actual =
        agrupadas.get(bicicleta.categoria) ??
        ({
          categoria: bicicleta.categoria,
          disponibles: 0,
          ultimasUnidades: 0,
          total: 0,
        } satisfies DisponibilidadPorCategoria);

      actual.total += 1;

      if (bicicleta.disponibilidad === DisponibilidadBicicleta.DISPONIBLE) {
        actual.disponibles += 1;
      }

      if (bicicleta.disponibilidad === DisponibilidadBicicleta.ULTIMAS_UNIDADES) {
        actual.ultimasUnidades += 1;
      }

      agrupadas.set(bicicleta.categoria, actual);
    }

    return Array.from(agrupadas.values()).sort((a, b) => a.categoria.localeCompare(b.categoria));
  }

  async listarReservas(query: ListarReservasQueryDto) {
    return this.reservasService.listar(query);
  }

  async crearReservaEnTienda(dto: CrearReservaTiendaDto) {
    return this.reservasService.crearReservaTienda(dto);
  }

  async actualizarDisponibilidadBicicleta(id: string, disponibilidad: DisponibilidadBicicleta) {
    const dto: ActualizarBicicletaDto = {
      disponibilidad,
    };

    return this.bicicletasService.actualizar(id, dto);
  }
}

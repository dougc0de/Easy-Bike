import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { REPOSITORIO_BICICLETAS, REPOSITORIO_RESERVAS } from '../comun/constantes/tokens-repositorios';
import { DisponibilidadBicicleta } from '../comun/enums/disponibilidad-bicicleta.enum';
import { EstadoReserva } from '../comun/enums/estado-reserva.enum';
import { OrigenReserva } from '../comun/enums/origen-reserva.enum';
import { obtenerSoloFechaActual, obtenerMarcaTiempoActual } from '../comun/utilidades/fechas.util';
import {
  construirNotaVoucher,
  extraerMontoDesdePrecio,
  formatearDuracionEnHoras,
  generarCodigoVoucher,
  horaRetiroPermitida,
  obtenerMetodoPagoPorDefecto,
} from '../comun/utilidades/reservas.util';
import { Bicicleta } from '../bicicletas/interfaces/bicicleta.interface';
import type { RepositorioBicicletas } from '../bicicletas/repositorios/bicicletas.repositorio';
import { CrearReservaTiendaDto } from './dto/crear-reserva-tienda.dto';
import { ActualizarReservaDto } from './dto/actualizar-reserva.dto';
import { ActualizarReservaClienteDto } from './dto/actualizar-reserva-cliente.dto';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { ListarReservasQueryDto } from './dto/listar-reservas.query.dto';
import { Reserva } from './interfaces/reserva.interface';
import { VoucherReserva } from './interfaces/voucher-reserva.interface';
import { DURACIONES_PERMITIDAS, PUNTO_RECOJO_EASY_BIKE } from './constantes/reservas.constantes';
import type { RepositorioReservas } from './repositorios/reservas.repositorio';

@Injectable()
export class ReservasService {
  constructor(
    @Inject(REPOSITORIO_RESERVAS)
    private readonly repositorioReservas: RepositorioReservas,
    @Inject(REPOSITORIO_BICICLETAS)
    private readonly repositorioBicicletas: RepositorioBicicletas,
  ) {}

  listar(query: ListarReservasQueryDto) {
    return this.repositorioReservas.listar(query);
  }

  async obtenerPorId(id: string): Promise<Reserva> {
    const reserva = await this.repositorioReservas.obtenerPorId(id);

    if (!reserva) {
      throw new NotFoundException(`No se encontró la reserva con id ${id}.`);
    }

    return reserva;
  }

  async crear(dto: CrearReservaDto) {
    return this.crearReserva(dto, OrigenReserva.CLIENTE_WEB, null);
  }

  async crearReservaTienda(dto: CrearReservaTiendaDto) {
    return this.crearReserva(dto, OrigenReserva.ADMIN_TIENDA, dto.handledByUserId ?? null);
  }

  async actualizarComoCliente(
    id: string,
    correoCliente: string,
    dto: ActualizarReservaClienteDto,
  ) {
    const reserva = await this.obtenerPorId(id);
    this.verificarReservaEditablePorCliente(reserva, correoCliente);

    return this.actualizar(id, {
      ...dto,
      email: correoCliente,
    });
  }

  async actualizar(id: string, dto: ActualizarReservaDto) {
    const actual = await this.obtenerPorId(id);
    const bicicleta = dto.bikeId
      ? await this.obtenerBicicletaReservable(dto.bikeId)
      : await this.obtenerBicicletaReservable(actual.bicicletaId, false);

    const fechaReserva = dto.date ?? actual.fechaReserva;
    const horaReserva = dto.time ?? actual.horaReserva;
    const duracionHoras = dto.duration ?? actual.duracionHoras;
    const puntoRecojo = dto.pickupPoint?.trim() ?? actual.puntoRecojo;

    const cambios: Partial<Reserva> = {
      nombreCliente: dto.fullName?.trim() ?? actual.nombreCliente,
      correoCliente: dto.email?.trim().toLowerCase() ?? actual.correoCliente,
      telefonoCliente:
        dto.phone === undefined ? actual.telefonoCliente : dto.phone.trim() || null,
      bicicletaId: bicicleta.id,
      nombreBicicleta: bicicleta.nombre,
      fechaReserva,
      horaReserva,
      duracionHoras,
      puntoRecojo,
      notas: dto.notes === undefined ? actual.notas : dto.notes.trim() || null,
      monto: extraerMontoDesdePrecio(bicicleta.precio),
      estado: dto.status ?? actual.estado,
      updatedAt: obtenerMarcaTiempoActual(),
    };

    this.validarReglasReserva({
      bikeId: bicicleta.id,
      date: fechaReserva,
      time: horaReserva,
      duration: duracionHoras,
      pickupPoint: puntoRecojo,
    });

    const actualizada = await this.repositorioReservas.actualizar(id, cambios);

    if (!actualizada) {
      throw new NotFoundException(`No se encontró la reserva con id ${id}.`);
    }

    return actualizada;
  }

  async eliminarComoCliente(id: string, correoCliente: string) {
    const reserva = await this.obtenerPorId(id);
    this.verificarReservaEditablePorCliente(reserva, correoCliente);

    return this.eliminar(id);
  }

  async eliminar(id: string) {
    const eliminada = await this.repositorioReservas.eliminar(id);

    if (!eliminada) {
      throw new NotFoundException(`No se encontró la reserva con id ${id}.`);
    }

    return {
      success: true,
      message: 'Reserva eliminada correctamente.',
    };
  }

  private verificarReservaEditablePorCliente(reserva: Reserva, correoCliente: string) {
    if (reserva.correoCliente.toLowerCase() !== correoCliente.trim().toLowerCase()) {
      throw new ForbiddenException('No puedes modificar o eliminar reservas de otro cliente.');
    }

    if (reserva.estado === EstadoReserva.COMPLETADA) {
      throw new ConflictException('No se puede modificar o eliminar una reserva completada.');
    }
  }

  private validarReglasReserva(payload: {
    bikeId: string;
    date: string;
    time: string;
    duration: number;
    pickupPoint: string;
  }) {
    if (!DURACIONES_PERMITIDAS.includes(payload.duration as (typeof DURACIONES_PERMITIDAS)[number])) {
      throw new BadRequestException('La duración permitida debe ser 4, 8, 12 o 24 horas.');
    }

    if (!horaRetiroPermitida(payload.time)) {
      throw new BadRequestException('La hora de retiro debe estar entre 08:00 y 20:00.');
    }

    if (payload.pickupPoint.trim() !== PUNTO_RECOJO_EASY_BIKE) {
      throw new BadRequestException(`El punto de recojo permitido es ${PUNTO_RECOJO_EASY_BIKE}.`);
    }

    if (payload.date < obtenerSoloFechaActual()) {
      throw new BadRequestException('La fecha de reserva no puede estar en el pasado.');
    }
  }

  private async obtenerBicicletaReservable(id: string, validarDisponibilidad = true): Promise<Bicicleta> {
    const bicicleta = await this.repositorioBicicletas.obtenerPorId(id);

    if (!bicicleta) {
      throw new NotFoundException(`No se encontró la bicicleta con id ${id}.`);
    }

    if (
      validarDisponibilidad &&
      ![
        DisponibilidadBicicleta.DISPONIBLE,
        DisponibilidadBicicleta.ULTIMAS_UNIDADES,
      ].includes(bicicleta.disponibilidad)
    ) {
      throw new ConflictException(
        'Solo se puede reservar una bicicleta Disponible o en Últimas unidades.',
      );
    }

    return bicicleta;
  }

  private construirVoucher(reserva: Reserva): VoucherReserva {
    return {
      code: reserva.codigoVoucher,
      bikeName: reserva.nombreBicicleta,
      date: reserva.fechaReserva,
      time: reserva.horaReserva,
      duration: formatearDuracionEnHoras(reserva.duracionHoras),
      pickupPoint: reserva.puntoRecojo,
      paymentMethod: reserva.metodoPago,
      note: construirNotaVoucher(),
    };
  }

  private async crearReserva(
    dto: CrearReservaDto,
    origen: OrigenReserva,
    atendidaPorUsuarioId: string | null,
  ) {
    this.validarReglasReserva(dto);

    const bicicleta = await this.obtenerBicicletaReservable(dto.bikeId);
    const marcaTiempo = obtenerMarcaTiempoActual();
    const prefijo = bicicleta.nombre
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 6)
      .toUpperCase();

    const reserva: Reserva = {
      id: randomUUID(),
      nombreCliente: dto.fullName.trim(),
      correoCliente: dto.email.trim().toLowerCase(),
      telefonoCliente: dto.phone?.trim() || null,
      bicicletaId: bicicleta.id,
      nombreBicicleta: bicicleta.nombre,
      fechaReserva: dto.date,
      horaReserva: dto.time,
      duracionHoras: dto.duration,
      puntoRecojo: dto.pickupPoint.trim(),
      notas: dto.notes.trim() || null,
      monto: extraerMontoDesdePrecio(bicicleta.precio),
      estado: EstadoReserva.PENDIENTE_DE_ENTREGA,
      codigoVoucher: generarCodigoVoucher(`RSV-${prefijo}`),
      metodoPago: obtenerMetodoPagoPorDefecto(),
      origen,
      atendidaPorUsuarioId,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    const creada = await this.repositorioReservas.crear(reserva);
    const voucher = this.construirVoucher(creada);

    return {
      success: true,
      code: creada.codigoVoucher,
      amount: creada.monto,
      voucher,
      message:
        'Reserva registrada correctamente. Tu voucher ya queda listo para mostrarlo al retirar la bicicleta. Recuerda que el pago se hace físicamente al retirar la bicicleta.',
      reservation: creada,
    };
  }
}

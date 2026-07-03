import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuarioActual } from '../autenticacion/decoradores/usuario-actual.decorator';
import { Roles } from '../autenticacion/decoradores/roles.decorator';
import { JwtAccessGuard } from '../autenticacion/guards/jwt-access.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import { ActualizarReservaDto } from './dto/actualizar-reserva.dto';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { ListarReservasQueryDto } from './dto/listar-reservas.query.dto';
import { Reserva } from './interfaces/reserva.interface';
import { ReservasService } from './reservas.service';
import type { UsuarioAutenticado } from '../autenticacion/interfaces/usuario-autenticado.interface';

function mapearResumenReserva(reserva: Reserva) {
  return {
    id: reserva.id,
    customerName: reserva.nombreCliente,
    customerEmail: reserva.correoCliente,
    bikeId: reserva.bicicletaId,
    bikeName: reserva.nombreBicicleta,
    date: reserva.fechaReserva,
    time: reserva.horaReserva,
    duration: `${reserva.duracionHoras} horas`,
    pickupPoint: reserva.puntoRecojo,
    amount: reserva.monto,
    status: reserva.estado,
    voucherCode: reserva.codigoVoucher,
    paymentMethod: reserva.metodoPago,
    createdAt: reserva.createdAt,
  };
}

@Controller('reservas')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RolUsuario.CLIENTE)
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get()
  async listar(
    @Query() query: ListarReservasQueryDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    const reservas = await this.reservasService.listar({
      ...query,
      correoCliente: usuarioActual.email,
    });

    return reservas.map((reserva) => mapearResumenReserva(reserva));
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string, @UsuarioActual() usuarioActual: UsuarioAutenticado) {
    const reserva = await this.reservasService.obtenerPorId(id);
    this.verificarPropietarioReserva(reserva, usuarioActual);

    return mapearResumenReserva(reserva);
  }

  @Post()
  async crear(@Body() dto: CrearReservaDto, @UsuarioActual() usuarioActual: UsuarioAutenticado) {
    const resultado = await this.reservasService.crear({
      ...dto,
      email: usuarioActual.email,
    });

    return {
      ...resultado,
      reservation: mapearResumenReserva(resultado.reservation),
    };
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarReservaDto) {
    const reserva = await this.reservasService.actualizar(id, dto);

    return mapearResumenReserva(reserva);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.reservasService.eliminar(id);
  }

  private verificarPropietarioReserva(reserva: Reserva, usuarioActual: UsuarioAutenticado) {
    if (reserva.correoCliente.toLowerCase() !== usuarioActual.email.toLowerCase()) {
      throw new ForbiddenException('No puedes consultar reservas de otro cliente.');
    }
  }
}

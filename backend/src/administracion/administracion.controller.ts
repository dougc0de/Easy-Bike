import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsuarioActual } from '../autenticacion/decoradores/usuario-actual.decorator';
import { Roles } from '../autenticacion/decoradores/roles.decorator';
import { JwtAccessGuard } from '../autenticacion/guards/jwt-access.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { ActualizarDisponibilidadAdminDto } from './dto/actualizar-disponibilidad-admin.dto';
import { AdministracionService } from './administracion.service';
import { CrearReservaTiendaDto } from '../reservas/dto/crear-reserva-tienda.dto';
import { ListarReservasQueryDto } from '../reservas/dto/listar-reservas.query.dto';
import { Reserva } from '../reservas/interfaces/reserva.interface';
import { Bicicleta } from '../bicicletas/interfaces/bicicleta.interface';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import type { UsuarioAutenticado } from '../autenticacion/interfaces/usuario-autenticado.interface';

function mapearResumenReservaAdmin(reserva: Reserva) {
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
    origin: reserva.origen,
    createdAt: reserva.createdAt,
  };
}

function mapearRespuestaBicicletaAdmin(bicicleta: Bicicleta) {
  return {
    id: bicicleta.id,
    name: bicicleta.nombre,
    category: bicicleta.categoria,
    shortDescription: bicicleta.descripcionCorta,
    detail: bicicleta.detalle,
    price: bicicleta.precio,
    autonomy: bicicleta.autonomia,
    availability: bicicleta.disponibilidad,
    accent: bicicleta.colorAcento,
    recommendedFor: bicicleta.recomendadoPara,
    imageUrl: bicicleta.urlImagen,
    imageAlt: bicicleta.textoAlternativoImagen,
    active: bicicleta.activo,
    createdAt: bicicleta.createdAt,
    updatedAt: bicicleta.updatedAt,
  };
}

@Controller('admin')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRACION)
export class AdministracionController {
  constructor(private readonly administracionService: AdministracionService) {}

  @Get('resumen')
  obtenerResumen() {
    return this.administracionService.obtenerResumen();
  }

  @Get('bicicletas/disponibilidad-por-categoria')
  obtenerDisponibilidadPorCategoria() {
    return this.administracionService.obtenerDisponibilidadPorCategoria();
  }

  @Get('reservas')
  async listarReservas(@Query() query: ListarReservasQueryDto) {
    const reservas = await this.administracionService.listarReservas(query);

    return reservas.map((reserva) => mapearResumenReservaAdmin(reserva));
  }

  @Post('reservas-en-tienda')
  async crearReservaEnTienda(
    @Body() dto: CrearReservaTiendaDto,
    @UsuarioActual() usuarioActual: UsuarioAutenticado,
  ) {
    const resultado = await this.administracionService.crearReservaEnTienda({
      ...dto,
      handledByUserId: usuarioActual.userId,
    });

    return {
      ...resultado,
      reservation: mapearResumenReservaAdmin(resultado.reservation),
    };
  }

  @Patch('bicicletas/:id/disponibilidad')
  actualizarDisponibilidad(
    @Param('id') id: string,
    @Body() dto: ActualizarDisponibilidadAdminDto,
  ) {
    return this.administracionService
      .actualizarDisponibilidadBicicleta(id, dto.disponibilidad)
      .then((bicicleta) => mapearRespuestaBicicletaAdmin(bicicleta));
  }
}

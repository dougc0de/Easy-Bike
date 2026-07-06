import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../autenticacion/decoradores/roles.decorator';
import { JwtAccessGuard } from '../autenticacion/guards/jwt-access.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';
import { CrearUbicacionDto } from './dto/crear-ubicacion.dto';
import { ListarUbicacionesQueryDto } from './dto/listar-ubicaciones.query.dto';
import { ConfiguracionUbicacion } from './interfaces/configuracion-ubicacion.interface';
import { UbicacionesService } from './ubicaciones.service';

function mapearRespuestaMapa(configuracion: ConfiguracionUbicacion) {
  return {
    title: configuracion.titulo,
    subtitle: configuracion.subtitulo,
    address: configuracion.direccion,
    schedule: configuracion.horario,
    contactPhone: configuracion.telefonoContacto,
    contactEmail: configuracion.emailContacto,
    ctaLabel: configuracion.etiquetaCta,
    externalUrl: configuracion.urlExterna,
    imageUrl: configuracion.urlImagen ?? '',
    embedUrl: configuracion.urlEmbed ?? '',
  };
}

@Controller('ubicaciones')
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Get()
  listar(@Query() query: ListarUbicacionesQueryDto) {
    return this.ubicacionesService.listar(query);
  }

  @Get('configuracion-mapa')
  async obtenerConfiguracionMapa() {
    const configuracion = await this.ubicacionesService.obtenerConfiguracionMapa();

    return mapearRespuestaMapa(configuracion);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.ubicacionesService.obtenerPorId(id);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Post()
  crear(@Body() dto: CrearUbicacionDto) {
    return this.ubicacionesService.crear(dto);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarUbicacionDto) {
    return this.ubicacionesService.actualizar(id, dto);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.ubicacionesService.eliminar(id);
  }
}

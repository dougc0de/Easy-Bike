import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../autenticacion/decoradores/roles.decorator';
import { JwtAccessGuard } from '../autenticacion/guards/jwt-access.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import { ActualizarBicicletaDto } from './dto/actualizar-bicicleta.dto';
import { CrearBicicletaDto } from './dto/crear-bicicleta.dto';
import { ListarBicicletasQueryDto } from './dto/listar-bicicletas.query.dto';
import { Bicicleta } from './interfaces/bicicleta.interface';
import { BicicletasService } from './bicicletas.service';

function mapearRespuestaBicicleta(bicicleta: Bicicleta) {
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

@Controller('bicicletas')
export class BicicletasController {
  constructor(private readonly bicicletasService: BicicletasService) {}

  @Get()
  async listar(@Query() query: ListarBicicletasQueryDto) {
    const bicicletas = await this.bicicletasService.listar(query);

    return bicicletas.map((bicicleta) => mapearRespuestaBicicleta(bicicleta));
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const bicicleta = await this.bicicletasService.obtenerPorId(id);

    return mapearRespuestaBicicleta(bicicleta);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Post()
  async crear(@Body() dto: CrearBicicletaDto) {
    const bicicleta = await this.bicicletasService.crear(dto);

    return mapearRespuestaBicicleta(bicicleta);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarBicicletaDto) {
    const bicicleta = await this.bicicletasService.actualizar(id, dto);

    return mapearRespuestaBicicleta(bicicleta);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.bicicletasService.eliminar(id);
  }
}

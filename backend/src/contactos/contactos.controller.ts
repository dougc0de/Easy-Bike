import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../autenticacion/decoradores/roles.decorator';
import { JwtAccessGuard } from '../autenticacion/guards/jwt-access.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import { ActualizarContactoDto } from './dto/actualizar-contacto.dto';
import { CrearContactoDto } from './dto/crear-contacto.dto';
import { ListarContactosQueryDto } from './dto/listar-contactos.query.dto';
import { ContactosService } from './contactos.service';

@Controller('contactos')
export class ContactosController {
  constructor(private readonly contactosService: ContactosService) {}

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Get()
  listar(@Query() query: ListarContactosQueryDto) {
    return this.contactosService.listar(query);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.contactosService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearContactoDto) {
    return this.contactosService.crear(dto);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarContactoDto) {
    return this.contactosService.actualizar(id, dto);
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(RolUsuario.ADMINISTRACION)
  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.contactosService.eliminar(id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../autenticacion/decoradores/roles.decorator';
import { JwtAccessGuard } from '../autenticacion/guards/jwt-access.guard';
import { RolesGuard } from '../autenticacion/guards/roles.guard';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ListarUsuariosQueryDto } from './dto/listar-usuarios.query.dto';
import { Usuario } from './interfaces/usuario.interface';
import { UsuariosService } from './usuarios.service';

function mapearRespuestaUsuario(usuario: Usuario) {
  return {
    id: usuario.id,
    email: usuario.email,
    nombreCompleto: usuario.nombreCompleto,
    rol: usuario.rol,
    telefono: usuario.telefono,
    activo: usuario.activo,
    ultimoAccesoAt: usuario.ultimoAccesoAt,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt,
  };
}

@Controller('usuarios')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(RolUsuario.ADMINISTRACION)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async listar(@Query() query: ListarUsuariosQueryDto) {
    const usuarios = await this.usuariosService.listar(query);

    return usuarios.map((usuario) => mapearRespuestaUsuario(usuario));
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    const usuario = await this.usuariosService.obtenerPorId(id);

    return mapearRespuestaUsuario(usuario);
  }

  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
    const usuario = await this.usuariosService.crear(dto);

    return mapearRespuestaUsuario(usuario);
  }

  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto) {
    const usuario = await this.usuariosService.actualizar(id, dto);

    return mapearRespuestaUsuario(usuario);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.usuariosService.eliminar(id);
  }
}

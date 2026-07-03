import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORIO_USUARIOS } from '../comun/constantes/tokens-repositorios';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ListarUsuariosQueryDto } from './dto/listar-usuarios.query.dto';
import {
  ActualizarUsuarioPersistencia,
  CrearUsuarioPersistencia,
  Usuario,
} from './interfaces/usuario.interface';
import type { RepositorioUsuarios } from './repositorios/usuarios.repositorio';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(REPOSITORIO_USUARIOS)
    private readonly repositorioUsuarios: RepositorioUsuarios,
  ) {}

  listar(query: ListarUsuariosQueryDto) {
    return this.repositorioUsuarios.listar(query);
  }

  async obtenerPorId(id: string): Promise<Usuario> {
    const usuario = await this.repositorioUsuarios.obtenerPorId(id);

    if (!usuario) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}.`);
    }

    return usuario;
  }

  async crear(dto: CrearUsuarioDto): Promise<Usuario> {
    const existente = await this.repositorioUsuarios.obtenerPorEmail(dto.email);

    if (existente) {
      throw new ConflictException('Ya existe un usuario registrado con ese correo.');
    }

    const datosUsuario: CrearUsuarioPersistencia = {
      email: dto.email.trim().toLowerCase(),
      nombreCompleto: dto.nombreCompleto.trim(),
      rol: dto.rol,
      telefono: dto.telefono?.trim() || null,
      activo: dto.activo ?? true,
    };

    return this.repositorioUsuarios.crear(datosUsuario);
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto): Promise<Usuario> {
    if (dto.email) {
      const existente = await this.repositorioUsuarios.obtenerPorEmail(dto.email);

      if (existente && existente.id !== id) {
        throw new ConflictException('Ese correo ya pertenece a otro usuario.');
      }
    }

    const cambios: ActualizarUsuarioPersistencia = {
      email: dto.email?.trim().toLowerCase(),
      nombreCompleto: dto.nombreCompleto?.trim(),
      rol: dto.rol,
      telefono: dto.telefono === undefined ? undefined : dto.telefono.trim() || null,
      activo: dto.activo,
    };

    const actualizado = await this.repositorioUsuarios.actualizar(id, cambios);

    if (!actualizado) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}.`);
    }

    return actualizado;
  }

  async eliminar(id: string) {
    const eliminado = await this.repositorioUsuarios.eliminar(id);

    if (!eliminado) {
      throw new NotFoundException(`No se encontró el usuario con id ${id}.`);
    }

    return {
      success: true,
      message: 'Usuario eliminado correctamente.',
    };
  }
}

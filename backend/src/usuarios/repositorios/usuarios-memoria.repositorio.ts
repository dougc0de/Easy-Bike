import { Injectable } from '@nestjs/common';
import { USUARIOS_SEMILLA } from '../../comun/datos/semillas';
import { clonarProfundo } from '../../comun/utilidades/clonacion.util';
import { obtenerMarcaTiempoActual } from '../../comun/utilidades/fechas.util';
import { aplicarPaginacion } from '../../comun/utilidades/paginacion.util';
import { ListarUsuariosQueryDto } from '../dto/listar-usuarios.query.dto';
import {
  ActualizarUsuarioPersistencia,
  CrearUsuarioPersistencia,
  Usuario,
} from '../interfaces/usuario.interface';
import { RepositorioUsuarios } from './usuarios.repositorio';
import { randomUUID } from 'crypto';

@Injectable()
export class UsuariosMemoriaRepositorio implements RepositorioUsuarios {
  private readonly usuarios: Usuario[] = clonarProfundo(USUARIOS_SEMILLA);

  async listar(query: ListarUsuariosQueryDto): Promise<Usuario[]> {
    const email = query.email?.trim().toLowerCase();
    const nombre = query.nombre?.trim().toLowerCase();

    const filtrados = this.usuarios.filter((usuario) => {
      if (email && usuario.email.toLowerCase() !== email) return false;
      if (query.rol && usuario.rol !== query.rol) return false;
      if (nombre && !usuario.nombreCompleto.toLowerCase().includes(nombre)) return false;

      return true;
    });

    return aplicarPaginacion(filtrados, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.find((usuario) => usuario.id === id) ?? null;
  }

  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.find((usuario) => usuario.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async crear(dto: CrearUsuarioPersistencia): Promise<Usuario> {
    const marcaTiempo = obtenerMarcaTiempoActual();
    const usuario: Usuario = {
      id: randomUUID(),
      email: dto.email.trim().toLowerCase(),
      nombreCompleto: dto.nombreCompleto.trim(),
      rol: dto.rol,
      telefono: dto.telefono?.trim() || null,
      passwordHash: dto.passwordHash ?? null,
      refreshTokenHash: dto.refreshTokenHash ?? null,
      activo: dto.activo ?? true,
      ultimoAccesoAt: dto.ultimoAccesoAt ?? null,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.usuarios.push(usuario);

    return usuario;
  }

  async actualizar(id: string, dto: ActualizarUsuarioPersistencia): Promise<Usuario | null> {
    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.usuarios[indice];

    const actualizado: Usuario = {
      ...actual,
      email: dto.email?.trim().toLowerCase() ?? actual.email,
      nombreCompleto: dto.nombreCompleto?.trim() ?? actual.nombreCompleto,
      rol: dto.rol ?? actual.rol,
      telefono:
        dto.telefono === undefined ? actual.telefono : dto.telefono?.trim() || null,
      passwordHash: dto.passwordHash === undefined ? actual.passwordHash : dto.passwordHash,
      refreshTokenHash:
        dto.refreshTokenHash === undefined ? actual.refreshTokenHash : dto.refreshTokenHash,
      activo: dto.activo ?? actual.activo,
      ultimoAccesoAt:
        dto.ultimoAccesoAt === undefined ? actual.ultimoAccesoAt : dto.ultimoAccesoAt,
      updatedAt: dto.updatedAt ?? obtenerMarcaTiempoActual(),
    };

    this.usuarios[indice] = actualizado;

    return actualizado;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return false;
    }

    this.usuarios.splice(indice, 1);

    return true;
  }
}

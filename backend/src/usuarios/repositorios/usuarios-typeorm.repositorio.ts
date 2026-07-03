import { Injectable } from '@nestjs/common';
import { BaseDatosService } from '../../base-datos/base-datos.service';
import { UsuarioEntidad } from '../../base-datos/entidades/usuario.entidad';
import { obtenerMarcaTiempoActual } from '../../comun/utilidades/fechas.util';
import { ListarUsuariosQueryDto } from '../dto/listar-usuarios.query.dto';
import {
  ActualizarUsuarioPersistencia,
  CrearUsuarioPersistencia,
  Usuario,
} from '../interfaces/usuario.interface';
import { RepositorioUsuarios } from './usuarios.repositorio';
import { randomUUID } from 'crypto';

@Injectable()
export class UsuariosTypeormRepositorio implements RepositorioUsuarios {
  constructor(private readonly baseDatosService: BaseDatosService) {}

  private get repositorio() {
    return this.baseDatosService.obtenerDataSource().getRepository(UsuarioEntidad);
  }

  private mapearEntidad(entidad: UsuarioEntidad): Usuario {
    return {
      id: entidad.id,
      email: entidad.email,
      nombreCompleto: entidad.nombreCompleto,
      rol: entidad.rol as Usuario['rol'],
      telefono: entidad.telefono,
      passwordHash: entidad.passwordHash,
      refreshTokenHash: entidad.refreshTokenHash,
      activo: entidad.activo,
      ultimoAccesoAt: entidad.ultimoAccesoAt?.toISOString() ?? null,
      createdAt: entidad.createdAt.toISOString(),
      updatedAt: entidad.updatedAt.toISOString(),
    };
  }

  async listar(query: ListarUsuariosQueryDto): Promise<Usuario[]> {
    const qb = this.repositorio.createQueryBuilder('usuario');

    if (query.email) {
      qb.andWhere('LOWER(usuario.email) = LOWER(:email)', { email: query.email.trim() });
    }

    if (query.rol) {
      qb.andWhere('usuario.rol = :rol', { rol: query.rol });
    }

    if (query.nombre) {
      qb.andWhere('LOWER(usuario.nombre_completo) LIKE LOWER(:nombre)', {
        nombre: `%${query.nombre.trim()}%`,
      });
    }

    qb.orderBy('usuario.created_at', 'DESC');
    qb.skip(query.offset ?? 0);
    qb.take(query.limit ?? 50);

    const entidades = await qb.getMany();

    return entidades.map((entidad) => this.mapearEntidad(entidad));
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    const entidad = await this.repositorio
      .createQueryBuilder('usuario')
      .where('LOWER(usuario.email) = LOWER(:email)', { email: email.trim() })
      .getOne();

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async crear(dto: CrearUsuarioPersistencia): Promise<Usuario> {
    const marcaTiempo = obtenerMarcaTiempoActual();

    const entidad = this.repositorio.create({
      id: randomUUID(),
      email: dto.email.trim().toLowerCase(),
      nombreCompleto: dto.nombreCompleto.trim(),
      rol: dto.rol,
      telefono: dto.telefono?.trim() || null,
      passwordHash: dto.passwordHash ?? null,
      refreshTokenHash: dto.refreshTokenHash ?? null,
      activo: dto.activo ?? true,
      ultimoAccesoAt: dto.ultimoAccesoAt ? new Date(dto.ultimoAccesoAt) : null,
      createdAt: new Date(marcaTiempo),
      updatedAt: new Date(marcaTiempo),
    });

    const guardado = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardado);
  }

  async actualizar(id: string, dto: ActualizarUsuarioPersistencia): Promise<Usuario | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    if (!entidad) {
      return null;
    }

    entidad.email = dto.email?.trim().toLowerCase() ?? entidad.email;
    entidad.nombreCompleto = dto.nombreCompleto?.trim() ?? entidad.nombreCompleto;
    entidad.rol = dto.rol ?? entidad.rol;
    entidad.telefono = dto.telefono === undefined ? entidad.telefono : dto.telefono?.trim() || null;
    entidad.passwordHash = dto.passwordHash === undefined ? entidad.passwordHash : dto.passwordHash;
    entidad.refreshTokenHash =
      dto.refreshTokenHash === undefined ? entidad.refreshTokenHash : dto.refreshTokenHash;
    entidad.activo = dto.activo ?? entidad.activo;
    entidad.ultimoAccesoAt =
      dto.ultimoAccesoAt === undefined
        ? entidad.ultimoAccesoAt
        : dto.ultimoAccesoAt
          ? new Date(dto.ultimoAccesoAt)
          : null;
    entidad.updatedAt = dto.updatedAt ? new Date(dto.updatedAt) : new Date();

    const guardado = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardado);
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await this.repositorio.delete({ id });

    return Boolean(resultado.affected);
  }
}

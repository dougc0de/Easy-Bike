import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BaseDatosService } from '../../base-datos/base-datos.service';
import { MensajeContactoEntidad } from '../../base-datos/entidades/mensaje-contacto.entidad';
import { EstadoMensajeContacto } from '../../comun/enums/estado-mensaje-contacto.enum';
import { ActualizarContactoDto } from '../dto/actualizar-contacto.dto';
import { CrearContactoDto } from '../dto/crear-contacto.dto';
import { ListarContactosQueryDto } from '../dto/listar-contactos.query.dto';
import { MensajeContacto } from '../interfaces/mensaje-contacto.interface';
import { RepositorioContactos } from './contactos.repositorio';

@Injectable()
export class ContactosTypeormRepositorio implements RepositorioContactos {
  constructor(private readonly baseDatosService: BaseDatosService) {}

  private get repositorio() {
    return this.baseDatosService.obtenerDataSource().getRepository(MensajeContactoEntidad);
  }

  private mapearEntidad(entidad: MensajeContactoEntidad): MensajeContacto {
    return {
      id: entidad.id,
      nombre: entidad.nombre,
      email: entidad.email,
      asunto: entidad.asunto,
      mensaje: entidad.mensaje,
      ticket: entidad.ticket,
      estado: entidad.estado as EstadoMensajeContacto,
      createdAt: entidad.createdAt.toISOString(),
      updatedAt: entidad.updatedAt.toISOString(),
    };
  }

  async listar(query: ListarContactosQueryDto): Promise<MensajeContacto[]> {
    const qb = this.repositorio.createQueryBuilder('contacto');

    if (query.email) {
      qb.andWhere('LOWER(contacto.email) = LOWER(:email)', { email: query.email.trim() });
    }

    if (query.estado) {
      qb.andWhere('contacto.estado = :estado', { estado: query.estado });
    }

    if (query.asunto) {
      qb.andWhere('LOWER(contacto.asunto) LIKE LOWER(:asunto)', {
        asunto: `%${query.asunto.trim()}%`,
      });
    }

    qb.orderBy('contacto.created_at', 'DESC');
    qb.skip(query.offset ?? 0);
    qb.take(query.limit ?? 50);

    const entidades = await qb.getMany();

    return entidades.map((entidad) => this.mapearEntidad(entidad));
  }

  async obtenerPorId(id: string): Promise<MensajeContacto | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async crear(dto: CrearContactoDto, ticket: string): Promise<MensajeContacto> {
    const marcaTiempo = new Date();
    const entidad = this.repositorio.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      email: dto.email.trim().toLowerCase(),
      asunto: dto.asunto.trim(),
      mensaje: dto.mensaje.trim(),
      ticket,
      estado: EstadoMensajeContacto.NUEVO,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    });

    const guardado = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardado);
  }

  async actualizar(id: string, dto: ActualizarContactoDto): Promise<MensajeContacto | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    if (!entidad) {
      return null;
    }

    entidad.nombre = dto.nombre?.trim() ?? entidad.nombre;
    entidad.email = dto.email?.trim().toLowerCase() ?? entidad.email;
    entidad.asunto = dto.asunto?.trim() ?? entidad.asunto;
    entidad.mensaje = dto.mensaje?.trim() ?? entidad.mensaje;
    entidad.estado = dto.estado ?? entidad.estado;
    entidad.updatedAt = new Date();

    const guardado = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardado);
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await this.repositorio.delete({ id });

    return Boolean(resultado.affected);
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MENSAJES_CONTACTO_SEMILLA } from '../../comun/datos/semillas';
import { clonarProfundo } from '../../comun/utilidades/clonacion.util';
import { obtenerMarcaTiempoActual } from '../../comun/utilidades/fechas.util';
import { aplicarPaginacion } from '../../comun/utilidades/paginacion.util';
import { EstadoMensajeContacto } from '../../comun/enums/estado-mensaje-contacto.enum';
import { ActualizarContactoDto } from '../dto/actualizar-contacto.dto';
import { CrearContactoDto } from '../dto/crear-contacto.dto';
import { ListarContactosQueryDto } from '../dto/listar-contactos.query.dto';
import { MensajeContacto } from '../interfaces/mensaje-contacto.interface';
import { RepositorioContactos } from './contactos.repositorio';

@Injectable()
export class ContactosMemoriaRepositorio implements RepositorioContactos {
  private readonly mensajes: MensajeContacto[] = clonarProfundo(MENSAJES_CONTACTO_SEMILLA);

  async listar(query: ListarContactosQueryDto): Promise<MensajeContacto[]> {
    const email = query.email?.trim().toLowerCase();
    const asunto = query.asunto?.trim().toLowerCase();

    const filtrados = this.mensajes.filter((mensaje) => {
      if (email && mensaje.email.toLowerCase() !== email) return false;
      if (query.estado && mensaje.estado !== query.estado) return false;
      if (asunto && !mensaje.asunto.toLowerCase().includes(asunto)) return false;

      return true;
    });

    return aplicarPaginacion(filtrados, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<MensajeContacto | null> {
    return this.mensajes.find((mensaje) => mensaje.id === id) ?? null;
  }

  async crear(dto: CrearContactoDto, ticket: string): Promise<MensajeContacto> {
    const marcaTiempo = obtenerMarcaTiempoActual();
    const mensaje: MensajeContacto = {
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      email: dto.email.trim().toLowerCase(),
      asunto: dto.asunto.trim(),
      mensaje: dto.mensaje.trim(),
      ticket,
      estado: EstadoMensajeContacto.NUEVO,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.mensajes.push(mensaje);

    return mensaje;
  }

  async actualizar(id: string, dto: ActualizarContactoDto): Promise<MensajeContacto | null> {
    const indice = this.mensajes.findIndex((mensaje) => mensaje.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.mensajes[indice];
    const actualizado: MensajeContacto = {
      ...actual,
      nombre: dto.nombre?.trim() ?? actual.nombre,
      email: dto.email?.trim().toLowerCase() ?? actual.email,
      asunto: dto.asunto?.trim() ?? actual.asunto,
      mensaje: dto.mensaje?.trim() ?? actual.mensaje,
      estado: dto.estado ?? actual.estado,
      updatedAt: obtenerMarcaTiempoActual(),
    };

    this.mensajes[indice] = actualizado;

    return actualizado;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.mensajes.findIndex((mensaje) => mensaje.id === id);

    if (indice === -1) {
      return false;
    }

    this.mensajes.splice(indice, 1);

    return true;
  }
}

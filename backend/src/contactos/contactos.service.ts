import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { REPOSITORIO_CONTACTOS } from '../comun/constantes/tokens-repositorios';
import { ActualizarContactoDto } from './dto/actualizar-contacto.dto';
import { CrearContactoDto } from './dto/crear-contacto.dto';
import { ListarContactosQueryDto } from './dto/listar-contactos.query.dto';
import type { RepositorioContactos } from './repositorios/contactos.repositorio';

@Injectable()
export class ContactosService {
  constructor(
    @Inject(REPOSITORIO_CONTACTOS)
    private readonly repositorioContactos: RepositorioContactos,
  ) {}

  listar(query: ListarContactosQueryDto) {
    return this.repositorioContactos.listar(query);
  }

  async obtenerPorId(id: string) {
    const contacto = await this.repositorioContactos.obtenerPorId(id);

    if (!contacto) {
      throw new NotFoundException(`No se encontró el mensaje de contacto con id ${id}.`);
    }

    return contacto;
  }

  async crear(dto: CrearContactoDto) {
    const ticket = `MSG-${Date.now().toString().slice(-5)}-${randomUUID().slice(0, 4).toUpperCase()}`;
    const contacto = await this.repositorioContactos.crear(dto, ticket);

    return {
      success: true,
      ticket: contacto.ticket,
      message: `Gracias ${contacto.nombre}, tu mensaje fue registrado correctamente.`,
      contacto,
    };
  }

  async actualizar(id: string, dto: ActualizarContactoDto) {
    const actualizado = await this.repositorioContactos.actualizar(id, dto);

    if (!actualizado) {
      throw new NotFoundException(`No se encontró el mensaje de contacto con id ${id}.`);
    }

    return actualizado;
  }

  async eliminar(id: string) {
    const eliminado = await this.repositorioContactos.eliminar(id);

    if (!eliminado) {
      throw new NotFoundException(`No se encontró el mensaje de contacto con id ${id}.`);
    }

    return {
      success: true,
      message: 'Mensaje de contacto eliminado correctamente.',
    };
  }
}

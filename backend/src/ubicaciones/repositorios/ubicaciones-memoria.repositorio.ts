import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UBICACIONES_SEMILLA } from '../../comun/datos/semillas';
import { clonarProfundo } from '../../comun/utilidades/clonacion.util';
import { obtenerMarcaTiempoActual } from '../../comun/utilidades/fechas.util';
import { aplicarPaginacion } from '../../comun/utilidades/paginacion.util';
import { ActualizarUbicacionDto } from '../dto/actualizar-ubicacion.dto';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';
import { ListarUbicacionesQueryDto } from '../dto/listar-ubicaciones.query.dto';
import { ConfiguracionUbicacion } from '../interfaces/configuracion-ubicacion.interface';
import { RepositorioUbicaciones } from './ubicaciones.repositorio';

@Injectable()
export class UbicacionesMemoriaRepositorio implements RepositorioUbicaciones {
  private readonly ubicaciones: ConfiguracionUbicacion[] = clonarProfundo(UBICACIONES_SEMILLA);

  async listar(query: ListarUbicacionesQueryDto): Promise<ConfiguracionUbicacion[]> {
    const titulo = query.titulo?.trim().toLowerCase();
    const direccion = query.direccion?.trim().toLowerCase();

    const filtradas = this.ubicaciones.filter((ubicacion) => {
      if (titulo && !ubicacion.titulo.toLowerCase().includes(titulo)) return false;
      if (direccion && !ubicacion.direccion.toLowerCase().includes(direccion)) return false;

      return true;
    });

    return aplicarPaginacion(filtradas, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<ConfiguracionUbicacion | null> {
    return this.ubicaciones.find((ubicacion) => ubicacion.id === id) ?? null;
  }

  async obtenerConfiguracionMapa(): Promise<ConfiguracionUbicacion | null> {
    return this.ubicaciones[0] ?? null;
  }

  async crear(dto: CrearUbicacionDto): Promise<ConfiguracionUbicacion> {
    const marcaTiempo = obtenerMarcaTiempoActual();
    const ubicacion: ConfiguracionUbicacion = {
      id: randomUUID(),
      titulo: dto.titulo.trim(),
      subtitulo: dto.subtitulo.trim(),
      direccion: dto.direccion.trim(),
      horario: dto.horario.trim(),
      etiquetaCta: dto.etiquetaCta.trim(),
      urlExterna: dto.urlExterna.trim(),
      urlImagen: dto.urlImagen?.trim() || null,
      urlEmbed: dto.urlEmbed?.trim() || null,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.ubicaciones.push(ubicacion);

    return ubicacion;
  }

  async actualizar(id: string, dto: ActualizarUbicacionDto): Promise<ConfiguracionUbicacion | null> {
    const indice = this.ubicaciones.findIndex((ubicacion) => ubicacion.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.ubicaciones[indice];
    const actualizada: ConfiguracionUbicacion = {
      ...actual,
      titulo: dto.titulo?.trim() ?? actual.titulo,
      subtitulo: dto.subtitulo?.trim() ?? actual.subtitulo,
      direccion: dto.direccion?.trim() ?? actual.direccion,
      horario: dto.horario?.trim() ?? actual.horario,
      etiquetaCta: dto.etiquetaCta?.trim() ?? actual.etiquetaCta,
      urlExterna: dto.urlExterna?.trim() ?? actual.urlExterna,
      urlImagen: dto.urlImagen === undefined ? actual.urlImagen : dto.urlImagen?.trim() || null,
      urlEmbed: dto.urlEmbed === undefined ? actual.urlEmbed : dto.urlEmbed?.trim() || null,
      updatedAt: obtenerMarcaTiempoActual(),
    };

    this.ubicaciones[indice] = actualizada;

    return actualizada;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.ubicaciones.findIndex((ubicacion) => ubicacion.id === id);

    if (indice === -1) {
      return false;
    }

    this.ubicaciones.splice(indice, 1);

    return true;
  }
}

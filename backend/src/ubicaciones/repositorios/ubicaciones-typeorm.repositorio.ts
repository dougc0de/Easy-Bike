import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BaseDatosService } from '../../base-datos/base-datos.service';
import { ConfiguracionUbicacionEntidad } from '../../base-datos/entidades/configuracion-ubicacion.entidad';
import { ActualizarUbicacionDto } from '../dto/actualizar-ubicacion.dto';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';
import { ListarUbicacionesQueryDto } from '../dto/listar-ubicaciones.query.dto';
import { ConfiguracionUbicacion } from '../interfaces/configuracion-ubicacion.interface';
import { RepositorioUbicaciones } from './ubicaciones.repositorio';

@Injectable()
export class UbicacionesTypeormRepositorio implements RepositorioUbicaciones {
  constructor(private readonly baseDatosService: BaseDatosService) {}

  private get repositorio() {
    return this.baseDatosService.obtenerDataSource().getRepository(ConfiguracionUbicacionEntidad);
  }

  private mapearEntidad(entidad: ConfiguracionUbicacionEntidad): ConfiguracionUbicacion {
    return {
      id: entidad.id,
      titulo: entidad.titulo,
      subtitulo: entidad.subtitulo,
      direccion: entidad.direccion,
      horario: entidad.horario,
      etiquetaCta: entidad.etiquetaCta,
      urlExterna: entidad.urlExterna,
      urlImagen: entidad.urlImagen,
      urlEmbed: entidad.urlEmbed,
      createdAt: entidad.createdAt.toISOString(),
      updatedAt: entidad.updatedAt.toISOString(),
    };
  }

  async listar(query: ListarUbicacionesQueryDto): Promise<ConfiguracionUbicacion[]> {
    const qb = this.repositorio.createQueryBuilder('ubicacion');

    if (query.titulo) {
      qb.andWhere('LOWER(ubicacion.titulo) LIKE LOWER(:titulo)', {
        titulo: `%${query.titulo.trim()}%`,
      });
    }

    if (query.direccion) {
      qb.andWhere('LOWER(ubicacion.direccion) LIKE LOWER(:direccion)', {
        direccion: `%${query.direccion.trim()}%`,
      });
    }

    qb.orderBy('ubicacion.created_at', 'DESC');
    qb.skip(query.offset ?? 0);
    qb.take(query.limit ?? 50);

    const entidades = await qb.getMany();

    return entidades.map((entidad) => this.mapearEntidad(entidad));
  }

  async obtenerPorId(id: string): Promise<ConfiguracionUbicacion | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async obtenerConfiguracionMapa(): Promise<ConfiguracionUbicacion | null> {
    const entidad = await this.repositorio
      .createQueryBuilder('ubicacion')
      .orderBy('ubicacion.updated_at', 'DESC')
      .getOne();

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async crear(dto: CrearUbicacionDto): Promise<ConfiguracionUbicacion> {
    const marcaTiempo = new Date();
    const entidad = this.repositorio.create({
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
    });

    const guardada = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardada);
  }

  async actualizar(id: string, dto: ActualizarUbicacionDto): Promise<ConfiguracionUbicacion | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    if (!entidad) {
      return null;
    }

    entidad.titulo = dto.titulo?.trim() ?? entidad.titulo;
    entidad.subtitulo = dto.subtitulo?.trim() ?? entidad.subtitulo;
    entidad.direccion = dto.direccion?.trim() ?? entidad.direccion;
    entidad.horario = dto.horario?.trim() ?? entidad.horario;
    entidad.etiquetaCta = dto.etiquetaCta?.trim() ?? entidad.etiquetaCta;
    entidad.urlExterna = dto.urlExterna?.trim() ?? entidad.urlExterna;
    entidad.urlImagen = dto.urlImagen === undefined ? entidad.urlImagen : dto.urlImagen?.trim() || null;
    entidad.urlEmbed = dto.urlEmbed === undefined ? entidad.urlEmbed : dto.urlEmbed?.trim() || null;
    entidad.updatedAt = new Date();

    const guardada = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardada);
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await this.repositorio.delete({ id });

    return Boolean(resultado.affected);
  }
}

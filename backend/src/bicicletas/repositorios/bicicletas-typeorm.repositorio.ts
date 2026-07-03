import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BaseDatosService } from '../../base-datos/base-datos.service';
import { BicicletaEntidad } from '../../base-datos/entidades/bicicleta.entidad';
import { ActualizarBicicletaDto } from '../dto/actualizar-bicicleta.dto';
import { CrearBicicletaDto } from '../dto/crear-bicicleta.dto';
import { ListarBicicletasQueryDto } from '../dto/listar-bicicletas.query.dto';
import { Bicicleta } from '../interfaces/bicicleta.interface';
import { RepositorioBicicletas } from './bicicletas.repositorio';

@Injectable()
export class BicicletasTypeormRepositorio implements RepositorioBicicletas {
  constructor(private readonly baseDatosService: BaseDatosService) {}

  private get repositorio() {
    return this.baseDatosService.obtenerDataSource().getRepository(BicicletaEntidad);
  }

  private mapearEntidad(entidad: BicicletaEntidad): Bicicleta {
    return {
      id: entidad.id,
      nombre: entidad.nombre,
      categoria: entidad.categoria,
      descripcionCorta: entidad.descripcionCorta,
      detalle: entidad.detalle,
      precio: entidad.precio,
      autonomia: entidad.autonomia,
      disponibilidad: entidad.disponibilidad as Bicicleta['disponibilidad'],
      colorAcento: entidad.colorAcento,
      recomendadoPara: entidad.recomendadoPara,
      urlImagen: entidad.urlImagen,
      textoAlternativoImagen: entidad.textoAlternativoImagen,
      activo: entidad.activo,
      createdAt: entidad.createdAt.toISOString(),
      updatedAt: entidad.updatedAt.toISOString(),
    };
  }

  async listar(query: ListarBicicletasQueryDto): Promise<Bicicleta[]> {
    const qb = this.repositorio.createQueryBuilder('bicicleta');

    if (query.categoria) {
      qb.andWhere('LOWER(bicicleta.categoria) = LOWER(:categoria)', {
        categoria: query.categoria.trim(),
      });
    }

    if (query.disponibilidad) {
      qb.andWhere('bicicleta.disponibilidad = :disponibilidad', {
        disponibilidad: query.disponibilidad,
      });
    }

    if (query.soloActivas === 'true') {
      qb.andWhere('bicicleta.activo = true');
    }

    if (query.busqueda) {
      qb.andWhere(
        '(LOWER(bicicleta.nombre) LIKE LOWER(:busqueda) OR LOWER(bicicleta.detalle) LIKE LOWER(:busqueda) OR LOWER(bicicleta.descripcion_corta) LIKE LOWER(:busqueda))',
        { busqueda: `%${query.busqueda.trim()}%` },
      );
    }

    qb.orderBy('bicicleta.created_at', 'DESC');
    qb.skip(query.offset ?? 0);
    qb.take(query.limit ?? 50);

    const entidades = await qb.getMany();

    return entidades.map((entidad) => this.mapearEntidad(entidad));
  }

  async obtenerPorId(id: string): Promise<Bicicleta | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    return entidad ? this.mapearEntidad(entidad) : null;
  }

  async crear(dto: CrearBicicletaDto): Promise<Bicicleta> {
    const marcaTiempo = new Date();

    const entidad = this.repositorio.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      categoria: dto.categoria.trim(),
      descripcionCorta: dto.descripcionCorta.trim(),
      detalle: dto.detalle.trim(),
      precio: dto.precio.trim(),
      autonomia: dto.autonomia.trim(),
      disponibilidad: dto.disponibilidad,
      colorAcento: dto.colorAcento.trim(),
      recomendadoPara: dto.recomendadoPara.trim(),
      urlImagen: dto.urlImagen.trim(),
      textoAlternativoImagen: dto.textoAlternativoImagen.trim(),
      activo: dto.activo ?? true,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    });

    const guardada = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardada);
  }

  async actualizar(id: string, dto: ActualizarBicicletaDto): Promise<Bicicleta | null> {
    const entidad = await this.repositorio.findOneBy({ id });

    if (!entidad) {
      return null;
    }

    entidad.nombre = dto.nombre?.trim() ?? entidad.nombre;
    entidad.categoria = dto.categoria?.trim() ?? entidad.categoria;
    entidad.descripcionCorta = dto.descripcionCorta?.trim() ?? entidad.descripcionCorta;
    entidad.detalle = dto.detalle?.trim() ?? entidad.detalle;
    entidad.precio = dto.precio?.trim() ?? entidad.precio;
    entidad.autonomia = dto.autonomia?.trim() ?? entidad.autonomia;
    entidad.disponibilidad = dto.disponibilidad ?? entidad.disponibilidad;
    entidad.colorAcento = dto.colorAcento?.trim() ?? entidad.colorAcento;
    entidad.recomendadoPara = dto.recomendadoPara?.trim() ?? entidad.recomendadoPara;
    entidad.urlImagen = dto.urlImagen?.trim() ?? entidad.urlImagen;
    entidad.textoAlternativoImagen =
      dto.textoAlternativoImagen?.trim() ?? entidad.textoAlternativoImagen;
    entidad.activo = dto.activo ?? entidad.activo;
    entidad.updatedAt = new Date();

    const guardada = await this.repositorio.save(entidad);

    return this.mapearEntidad(guardada);
  }

  async eliminar(id: string): Promise<boolean> {
    const resultado = await this.repositorio.delete({ id });

    return Boolean(resultado.affected);
  }
}

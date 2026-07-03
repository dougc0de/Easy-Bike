import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BICICLETAS_SEMILLA } from '../../comun/datos/semillas';
import { clonarProfundo } from '../../comun/utilidades/clonacion.util';
import { obtenerMarcaTiempoActual } from '../../comun/utilidades/fechas.util';
import { aplicarPaginacion } from '../../comun/utilidades/paginacion.util';
import { ActualizarBicicletaDto } from '../dto/actualizar-bicicleta.dto';
import { CrearBicicletaDto } from '../dto/crear-bicicleta.dto';
import { ListarBicicletasQueryDto } from '../dto/listar-bicicletas.query.dto';
import { Bicicleta } from '../interfaces/bicicleta.interface';
import { RepositorioBicicletas } from './bicicletas.repositorio';

@Injectable()
export class BicicletasMemoriaRepositorio implements RepositorioBicicletas {
  private readonly bicicletas: Bicicleta[] = clonarProfundo(BICICLETAS_SEMILLA);

  async listar(query: ListarBicicletasQueryDto): Promise<Bicicleta[]> {
    const busqueda = query.busqueda?.trim().toLowerCase();
    const categoria = query.categoria?.trim().toLowerCase();
    const soloActivas = query.soloActivas === 'true';

    const filtradas = this.bicicletas.filter((bicicleta) => {
      if (categoria && bicicleta.categoria.toLowerCase() !== categoria) return false;
      if (query.disponibilidad && bicicleta.disponibilidad !== query.disponibilidad) return false;
      if (soloActivas && !bicicleta.activo) return false;

      if (busqueda) {
        const texto = [
          bicicleta.nombre,
          bicicleta.categoria,
          bicicleta.descripcionCorta,
          bicicleta.detalle,
          bicicleta.recomendadoPara,
        ]
          .join(' ')
          .toLowerCase();

        if (!texto.includes(busqueda)) return false;
      }

      return true;
    });

    return aplicarPaginacion(filtradas, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<Bicicleta | null> {
    return this.bicicletas.find((bicicleta) => bicicleta.id === id) ?? null;
  }

  async crear(dto: CrearBicicletaDto): Promise<Bicicleta> {
    const marcaTiempo = obtenerMarcaTiempoActual();
    const bicicleta: Bicicleta = {
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
    };

    this.bicicletas.push(bicicleta);

    return bicicleta;
  }

  async actualizar(id: string, dto: ActualizarBicicletaDto): Promise<Bicicleta | null> {
    const indice = this.bicicletas.findIndex((bicicleta) => bicicleta.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.bicicletas[indice];
    const actualizada: Bicicleta = {
      ...actual,
      nombre: dto.nombre?.trim() ?? actual.nombre,
      categoria: dto.categoria?.trim() ?? actual.categoria,
      descripcionCorta: dto.descripcionCorta?.trim() ?? actual.descripcionCorta,
      detalle: dto.detalle?.trim() ?? actual.detalle,
      precio: dto.precio?.trim() ?? actual.precio,
      autonomia: dto.autonomia?.trim() ?? actual.autonomia,
      disponibilidad: dto.disponibilidad ?? actual.disponibilidad,
      colorAcento: dto.colorAcento?.trim() ?? actual.colorAcento,
      recomendadoPara: dto.recomendadoPara?.trim() ?? actual.recomendadoPara,
      urlImagen: dto.urlImagen?.trim() ?? actual.urlImagen,
      textoAlternativoImagen: dto.textoAlternativoImagen?.trim() ?? actual.textoAlternativoImagen,
      activo: dto.activo ?? actual.activo,
      updatedAt: obtenerMarcaTiempoActual(),
    };

    this.bicicletas[indice] = actualizada;

    return actualizada;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.bicicletas.findIndex((bicicleta) => bicicleta.id === id);

    if (indice === -1) {
      return false;
    }

    this.bicicletas.splice(indice, 1);

    return true;
  }
}

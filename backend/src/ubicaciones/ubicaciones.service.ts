import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORIO_UBICACIONES } from '../comun/constantes/tokens-repositorios';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';
import { CrearUbicacionDto } from './dto/crear-ubicacion.dto';
import { ListarUbicacionesQueryDto } from './dto/listar-ubicaciones.query.dto';
import type { RepositorioUbicaciones } from './repositorios/ubicaciones.repositorio';

@Injectable()
export class UbicacionesService {
  constructor(
    @Inject(REPOSITORIO_UBICACIONES)
    private readonly repositorioUbicaciones: RepositorioUbicaciones,
  ) {}

  listar(query: ListarUbicacionesQueryDto) {
    return this.repositorioUbicaciones.listar(query);
  }

  async obtenerPorId(id: string) {
    const ubicacion = await this.repositorioUbicaciones.obtenerPorId(id);

    if (!ubicacion) {
      throw new NotFoundException(`No se encontró la ubicación con id ${id}.`);
    }

    return ubicacion;
  }

  async obtenerConfiguracionMapa() {
    const configuracion = await this.repositorioUbicaciones.obtenerConfiguracionMapa();

    if (!configuracion) {
      throw new NotFoundException('No existe una configuración de mapa registrada.');
    }

    return configuracion;
  }

  crear(dto: CrearUbicacionDto) {
    return this.repositorioUbicaciones.crear(dto);
  }

  async actualizar(id: string, dto: ActualizarUbicacionDto) {
    const actualizada = await this.repositorioUbicaciones.actualizar(id, dto);

    if (!actualizada) {
      throw new NotFoundException(`No se encontró la ubicación con id ${id}.`);
    }

    return actualizada;
  }

  async eliminar(id: string) {
    const eliminada = await this.repositorioUbicaciones.eliminar(id);

    if (!eliminada) {
      throw new NotFoundException(`No se encontró la ubicación con id ${id}.`);
    }

    return {
      success: true,
      message: 'Ubicación eliminada correctamente.',
    };
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REPOSITORIO_BICICLETAS } from '../comun/constantes/tokens-repositorios';
import { ActualizarBicicletaDto } from './dto/actualizar-bicicleta.dto';
import { CrearBicicletaDto } from './dto/crear-bicicleta.dto';
import { ListarBicicletasQueryDto } from './dto/listar-bicicletas.query.dto';
import { Bicicleta } from './interfaces/bicicleta.interface';
import type { RepositorioBicicletas } from './repositorios/bicicletas.repositorio';

@Injectable()
export class BicicletasService {
  constructor(
    @Inject(REPOSITORIO_BICICLETAS)
    private readonly repositorioBicicletas: RepositorioBicicletas,
  ) {}

  listar(query: ListarBicicletasQueryDto) {
    return this.repositorioBicicletas.listar(query);
  }

  async obtenerPorId(id: string): Promise<Bicicleta> {
    const bicicleta = await this.repositorioBicicletas.obtenerPorId(id);

    if (!bicicleta) {
      throw new NotFoundException(`No se encontró la bicicleta con id ${id}.`);
    }

    return bicicleta;
  }

  crear(dto: CrearBicicletaDto) {
    return this.repositorioBicicletas.crear(dto);
  }

  async actualizar(id: string, dto: ActualizarBicicletaDto) {
    const actualizada = await this.repositorioBicicletas.actualizar(id, dto);

    if (!actualizada) {
      throw new NotFoundException(`No se encontró la bicicleta con id ${id}.`);
    }

    return actualizada;
  }

  async eliminar(id: string) {
    const eliminada = await this.repositorioBicicletas.eliminar(id);

    if (!eliminada) {
      throw new NotFoundException(`No se encontró la bicicleta con id ${id}.`);
    }

    return {
      success: true,
      message: 'Bicicleta eliminada correctamente.',
    };
  }
}

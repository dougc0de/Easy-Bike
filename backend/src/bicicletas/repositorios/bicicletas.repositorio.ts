import { ActualizarBicicletaDto } from '../dto/actualizar-bicicleta.dto';
import { CrearBicicletaDto } from '../dto/crear-bicicleta.dto';
import { ListarBicicletasQueryDto } from '../dto/listar-bicicletas.query.dto';
import { Bicicleta } from '../interfaces/bicicleta.interface';

export interface RepositorioBicicletas {
  listar(query: ListarBicicletasQueryDto): Promise<Bicicleta[]>;
  obtenerPorId(id: string): Promise<Bicicleta | null>;
  crear(dto: CrearBicicletaDto): Promise<Bicicleta>;
  actualizar(id: string, dto: ActualizarBicicletaDto): Promise<Bicicleta | null>;
  eliminar(id: string): Promise<boolean>;
}

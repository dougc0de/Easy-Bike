import { ActualizarUbicacionDto } from '../dto/actualizar-ubicacion.dto';
import { CrearUbicacionDto } from '../dto/crear-ubicacion.dto';
import { ListarUbicacionesQueryDto } from '../dto/listar-ubicaciones.query.dto';
import { ConfiguracionUbicacion } from '../interfaces/configuracion-ubicacion.interface';

export interface RepositorioUbicaciones {
  listar(query: ListarUbicacionesQueryDto): Promise<ConfiguracionUbicacion[]>;
  obtenerPorId(id: string): Promise<ConfiguracionUbicacion | null>;
  obtenerConfiguracionMapa(): Promise<ConfiguracionUbicacion | null>;
  crear(dto: CrearUbicacionDto): Promise<ConfiguracionUbicacion>;
  actualizar(id: string, dto: ActualizarUbicacionDto): Promise<ConfiguracionUbicacion | null>;
  eliminar(id: string): Promise<boolean>;
}

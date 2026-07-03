import { ListarUsuariosQueryDto } from '../dto/listar-usuarios.query.dto';
import {
  ActualizarUsuarioPersistencia,
  CrearUsuarioPersistencia,
  Usuario,
} from '../interfaces/usuario.interface';

export interface RepositorioUsuarios {
  listar(query: ListarUsuariosQueryDto): Promise<Usuario[]>;
  obtenerPorId(id: string): Promise<Usuario | null>;
  obtenerPorEmail(email: string): Promise<Usuario | null>;
  crear(dto: CrearUsuarioPersistencia): Promise<Usuario>;
  actualizar(id: string, dto: ActualizarUsuarioPersistencia): Promise<Usuario | null>;
  eliminar(id: string): Promise<boolean>;
}

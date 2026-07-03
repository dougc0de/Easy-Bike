import { ActualizarContactoDto } from '../dto/actualizar-contacto.dto';
import { CrearContactoDto } from '../dto/crear-contacto.dto';
import { ListarContactosQueryDto } from '../dto/listar-contactos.query.dto';
import { MensajeContacto } from '../interfaces/mensaje-contacto.interface';

export interface RepositorioContactos {
  listar(query: ListarContactosQueryDto): Promise<MensajeContacto[]>;
  obtenerPorId(id: string): Promise<MensajeContacto | null>;
  crear(dto: CrearContactoDto, ticket: string): Promise<MensajeContacto>;
  actualizar(id: string, dto: ActualizarContactoDto): Promise<MensajeContacto | null>;
  eliminar(id: string): Promise<boolean>;
}

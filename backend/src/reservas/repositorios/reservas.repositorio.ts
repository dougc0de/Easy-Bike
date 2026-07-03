import { ListarReservasQueryDto } from '../dto/listar-reservas.query.dto';
import { Reserva } from '../interfaces/reserva.interface';

export interface RepositorioReservas {
  listar(query: ListarReservasQueryDto): Promise<Reserva[]>;
  obtenerPorId(id: string): Promise<Reserva | null>;
  crear(reserva: Reserva): Promise<Reserva>;
  actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva | null>;
  eliminar(id: string): Promise<boolean>;
}

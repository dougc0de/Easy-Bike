import { EstadoReserva } from '../../comun/enums/estado-reserva.enum';
import { MetodoPagoReserva } from '../../comun/enums/metodo-pago.enum';
import { OrigenReserva } from '../../comun/enums/origen-reserva.enum';

export interface Reserva {
  id: string;
  nombreCliente: string;
  correoCliente: string;
  telefonoCliente: string;
  bicicletaId: string;
  nombreBicicleta: string;
  fechaReserva: string;
  horaReserva: string;
  duracionHoras: number;
  puntoRecojo: string;
  notas: string | null;
  monto: number;
  estado: EstadoReserva;
  codigoVoucher: string;
  metodoPago: MetodoPagoReserva;
  origen: OrigenReserva;
  atendidaPorUsuarioId: string | null;
  createdAt: string;
  updatedAt: string;
}

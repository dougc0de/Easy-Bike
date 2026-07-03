import { EstadoMensajeContacto } from '../../comun/enums/estado-mensaje-contacto.enum';

export interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  ticket: string;
  estado: EstadoMensajeContacto;
  createdAt: string;
  updatedAt: string;
}

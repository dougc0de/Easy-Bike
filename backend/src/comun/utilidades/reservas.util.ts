import { randomUUID } from 'crypto';
import { MetodoPagoReserva } from '../enums/metodo-pago.enum';

const HORA_MINIMA_MINUTOS = 8 * 60;
const HORA_MAXIMA_MINUTOS = 20 * 60;

export function convertirHoraAMinutos(valor: string): number | null {
  const [horasTexto = '', minutosTexto = ''] = valor.split(':');
  const horas = Number(horasTexto);
  const minutos = Number(minutosTexto);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) {
    return null;
  }

  return horas * 60 + minutos;
}

export function horaRetiroPermitida(valor: string): boolean {
  const minutos = convertirHoraAMinutos(valor);

  if (minutos === null) {
    return false;
  }

  return minutos >= HORA_MINIMA_MINUTOS && minutos <= HORA_MAXIMA_MINUTOS;
}

export function extraerMontoDesdePrecio(etiquetaPrecio: string): number {
  const coincidencia = etiquetaPrecio.match(/\$ ?(\d+(?:\.\d+)?)/);

  return coincidencia ? Number(coincidencia[1]) : 0;
}

export function formatearDuracionEnHoras(valor: number): string {
  return `${valor} horas`;
}

export function generarCodigoVoucher(prefijo: string): string {
  return `${prefijo}-${Date.now().toString().slice(-4)}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export function construirNotaVoucher(): string {
  return 'Presenta este voucher al retirar tu bicicleta. El pago se completa físicamente en el punto de recojo.';
}

export function obtenerMetodoPagoPorDefecto(): MetodoPagoReserva {
  return MetodoPagoReserva.PAGO_FISICO;
}

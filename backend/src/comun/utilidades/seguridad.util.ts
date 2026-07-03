import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const LONGITUD_HASH = 64;

export async function generarHashSeguro(valorPlano: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(valorPlano, salt, LONGITUD_HASH)) as Buffer;

  return `scrypt$${salt}$${hash.toString('hex')}`;
}

export async function compararHashSeguro(valorPlano: string, hashGuardado: string): Promise<boolean> {
  const [algoritmo, salt, hashHex] = hashGuardado.split('$');

  if (algoritmo !== 'scrypt' || !salt || !hashHex) {
    return false;
  }

  const hashPlano = (await scrypt(valorPlano, salt, LONGITUD_HASH)) as Buffer;
  const hashObjetivo = Buffer.from(hashHex, 'hex');

  if (hashPlano.length !== hashObjetivo.length) {
    return false;
  }

  return timingSafeEqual(hashPlano, hashObjetivo);
}

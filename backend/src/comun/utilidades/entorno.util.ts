export type ModoDatos = 'memoria' | 'typeorm';

export function obtenerModoDatos(): ModoDatos {
  const valor = process.env.MODO_DATOS?.trim().toLowerCase();

  return valor === 'typeorm' ? 'typeorm' : 'memoria';
}

export function obtenerBanderaBooleana(valor: string | undefined, valorPorDefecto = false): boolean {
  if (valor === undefined) return valorPorDefecto;

  return ['1', 'true', 'si', 'sí', 'yes'].includes(valor.trim().toLowerCase());
}

export function obtenerMarcaTiempoActual(): string {
  return new Date().toISOString();
}

export function obtenerSoloFechaActual(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

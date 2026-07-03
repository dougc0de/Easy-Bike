export function clonarProfundo<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

export function aplicarPaginacion<T>(items: T[], offset = 0, limit = 50): T[] {
  return items.slice(offset, offset + limit);
}

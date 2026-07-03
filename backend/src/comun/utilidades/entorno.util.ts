export type ModoDatos = 'memoria' | 'typeorm';
export type TipoConexionBaseDatos = 'pooler' | 'directa' | 'ninguna';

export function obtenerVariableEntorno(nombre: string): string | undefined {
  const valor = process.env[nombre]?.trim();

  return valor ? valor : undefined;
}

export function obtenerModoDatos(): ModoDatos {
  const valor = obtenerVariableEntorno('MODO_DATOS')?.toLowerCase();

  if (!valor) {
    return 'memoria';
  }

  if (valor === 'memoria' || valor === 'typeorm') {
    return valor;
  }

  throw new Error(`MODO_DATOS inválido: "${valor}". Usa "memoria" o "typeorm".`);
}

export function obtenerBanderaBooleana(valor: string | undefined, valorPorDefecto = false): boolean {
  if (valor === undefined) return valorPorDefecto;

  return ['1', 'true', 'si', 'sí', 'yes'].includes(valor.trim().toLowerCase());
}

export function esProduccion(): boolean {
  return obtenerVariableEntorno('NODE_ENV')?.toLowerCase() === 'production';
}

export function normalizarOrigenHttp(nombre: string, valor: string | undefined): string | undefined {
  if (!valor) {
    return undefined;
  }

  const valorNormalizado = /^[a-z]+:\/\//i.test(valor)
    ? valor
    : valor.startsWith('localhost') || valor.startsWith('127.0.0.1')
      ? `http://${valor}`
      : `https://${valor}`;

  let url: URL;

  try {
    url = new URL(valorNormalizado);
  } catch {
    throw new Error(`${nombre} debe ser una URL válida con protocolo http o https.`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${nombre} debe usar protocolo http o https.`);
  }

  return url.origin;
}

export function obtenerOrigenesCorsPermitidos(): string[] {
  const origenes = esProduccion()
    ? [normalizarOrigenHttp('FRONTEND_URL', obtenerVariableEntorno('FRONTEND_URL'))]
    : [
        normalizarOrigenHttp('FRONTEND_URL', obtenerVariableEntorno('FRONTEND_URL')),
        normalizarOrigenHttp('FRONTEND_URL_PROD', obtenerVariableEntorno('FRONTEND_URL_PROD')),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];

  return Array.from(new Set(origenes.filter((origen): origen is string => Boolean(origen))));
}

export function obtenerConfiguracionConexionBaseDatos(): {
  tipoConexion: TipoConexionBaseDatos;
  url?: string;
} {
  const urlPooler = obtenerVariableEntorno('DATABASE_URL_POOLER');

  if (urlPooler) {
    return {
      tipoConexion: 'pooler',
      url: urlPooler,
    };
  }

  const urlDirecta = obtenerVariableEntorno('DATABASE_URL');

  if (urlDirecta) {
    return {
      tipoConexion: 'directa',
      url: urlDirecta,
    };
  }

  return {
    tipoConexion: 'ninguna',
  };
}

export function validarConfiguracionCriticaProduccion() {
  if (!esProduccion()) {
    return;
  }

  const faltantes: string[] = [];
  const frontendUrl = obtenerVariableEntorno('FRONTEND_URL');
  const jwtSecret = obtenerVariableEntorno('JWT_SECRET');
  const jwtRefreshSecret = obtenerVariableEntorno('JWT_REFRESH_SECRET');
  const modoDatos = obtenerModoDatos();
  const conexionBaseDatos = obtenerConfiguracionConexionBaseDatos();

  if (!frontendUrl) {
    faltantes.push('FRONTEND_URL');
  }

  if (!jwtSecret) {
    faltantes.push('JWT_SECRET');
  }

  if (!jwtRefreshSecret) {
    faltantes.push('JWT_REFRESH_SECRET');
  }

  if (modoDatos === 'typeorm' && !conexionBaseDatos.url) {
    faltantes.push('DATABASE_URL_POOLER o DATABASE_URL');
  }

  if (faltantes.length) {
    throw new Error(
      `Configuración crítica faltante para producción: ${faltantes.join(', ')}.`,
    );
  }

  const origenFrontend = normalizarOrigenHttp('FRONTEND_URL', frontendUrl);

  if (!origenFrontend?.startsWith('https://')) {
    throw new Error('FRONTEND_URL debe usar https en producción.');
  }
}

export function obtenerResumenConfiguracionArranque() {
  return {
    produccion: esProduccion(),
    modoDatos: obtenerModoDatos(),
    origenesCors: obtenerOrigenesCorsPermitidos(),
    tipoConexionBaseDatos: obtenerConfiguracionConexionBaseDatos().tipoConexion,
  };
}

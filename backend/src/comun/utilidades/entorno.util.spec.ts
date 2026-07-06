import { BaseDatosModule } from '../../base-datos/base-datos.module';
import { obtenerModoDatos } from './entorno.util';

describe('entorno.util', () => {
  const originalModoDatos = process.env.MODO_DATOS;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalDatabaseUrlPooler = process.env.DATABASE_URL_POOLER;

  afterEach(() => {
    if (originalModoDatos === undefined) {
      delete process.env.MODO_DATOS;
    } else {
      process.env.MODO_DATOS = originalModoDatos;
    }

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }

    if (originalDatabaseUrlPooler === undefined) {
      delete process.env.DATABASE_URL_POOLER;
    } else {
      process.env.DATABASE_URL_POOLER = originalDatabaseUrlPooler;
    }
  });

  it('usa typeorm por defecto cuando MODO_DATOS no está definido', () => {
    delete process.env.MODO_DATOS;

    expect(obtenerModoDatos()).toBe('typeorm');
  });

  it('rechaza el modo memoria como opción operativa', () => {
    process.env.MODO_DATOS = 'memoria';

    expect(() => obtenerModoDatos()).toThrow('Usa únicamente "typeorm"');
  });

  it('falla al registrar base de datos si no existe configuración real', () => {
    process.env.MODO_DATOS = 'typeorm';
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_POOLER;

    expect(() => BaseDatosModule.registrar()).toThrow(
      'Easy Bike requiere DATABASE_URL o DATABASE_URL_POOLER',
    );
  });
});

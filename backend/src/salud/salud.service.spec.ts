import { SaludService } from './salud.service';
import { BaseDatosService } from '../base-datos/base-datos.service';

describe('SaludService', () => {
  it('reporta estado general y modo de datos', () => {
    const baseDatosService = {
      obtenerModo: jest.fn().mockReturnValue('typeorm'),
      estaConfigurada: jest.fn().mockReturnValue(true),
      estaInicializada: jest.fn().mockReturnValue(true),
      obtenerTipoConexionConfigurada: jest.fn().mockReturnValue('pooler'),
    } as unknown as BaseDatosService;

    const service = new SaludService(baseDatosService);
    const estado = service.obtenerEstadoGeneral();

    expect(estado.status).toBe('ok');
    expect(estado.mode).toBe('typeorm');
  });

  it('reporta el estado de base de datos conectada', () => {
    const baseDatosService = {
      obtenerModo: jest.fn().mockReturnValue('typeorm'),
      estaConfigurada: jest.fn().mockReturnValue(true),
      estaInicializada: jest.fn().mockReturnValue(true),
      obtenerTipoConexionConfigurada: jest.fn().mockReturnValue('pooler'),
    } as unknown as BaseDatosService;

    const service = new SaludService(baseDatosService);
    const estado = service.obtenerEstadoBaseDatos();

    expect(estado.status).toBe('conectada');
    expect(estado.connected).toBe(true);
    expect(estado.connectionType).toBe('pooler');
  });
});

import { SaludService } from './salud.service';
import { BaseDatosService } from '../base-datos/base-datos.service';

describe('SaludService', () => {
  it('reporta estado general y modo de datos', () => {
    const baseDatosService = {
      obtenerModo: jest.fn().mockReturnValue('memoria'),
      estaConfigurada: jest.fn().mockReturnValue(false),
      estaInicializada: jest.fn().mockReturnValue(false),
      obtenerTipoConexionConfigurada: jest.fn().mockReturnValue('ninguna'),
    } as unknown as BaseDatosService;

    const service = new SaludService(baseDatosService);
    const estado = service.obtenerEstadoGeneral();

    expect(estado.status).toBe('ok');
    expect(estado.mode).toBe('memoria');
  });

  it('reporta el estado de base de datos en memoria', () => {
    const baseDatosService = {
      obtenerModo: jest.fn().mockReturnValue('memoria'),
      estaConfigurada: jest.fn().mockReturnValue(false),
      estaInicializada: jest.fn().mockReturnValue(false),
      obtenerTipoConexionConfigurada: jest.fn().mockReturnValue('ninguna'),
    } as unknown as BaseDatosService;

    const service = new SaludService(baseDatosService);
    const estado = service.obtenerEstadoBaseDatos();

    expect(estado.status).toBe('memoria');
    expect(estado.connected).toBe(false);
    expect(estado.connectionType).toBe('ninguna');
  });
});

import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_UBICACIONES } from '../comun/constantes/tokens-repositorios';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';
import { UbicacionesMemoriaRepositorio } from './repositorios/ubicaciones-memoria.repositorio';
import { UbicacionesTypeormRepositorio } from './repositorios/ubicaciones-typeorm.repositorio';
import { UbicacionesController } from './ubicaciones.controller';
import { UbicacionesService } from './ubicaciones.service';

const proveedorRepositorioUbicaciones: Provider = {
  provide: REPOSITORIO_UBICACIONES,
  useClass:
    obtenerModoDatos() === 'typeorm'
      ? UbicacionesTypeormRepositorio
      : UbicacionesMemoriaRepositorio,
};

@Module({
  controllers: [UbicacionesController],
  providers: [
    UbicacionesService,
    UbicacionesMemoriaRepositorio,
    UbicacionesTypeormRepositorio,
    proveedorRepositorioUbicaciones,
  ],
  exports: [UbicacionesService, REPOSITORIO_UBICACIONES],
})
export class UbicacionesModule {}

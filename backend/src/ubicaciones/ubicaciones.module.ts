import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_UBICACIONES } from '../comun/constantes/tokens-repositorios';
import { UbicacionesTypeormRepositorio } from './repositorios/ubicaciones-typeorm.repositorio';
import { UbicacionesController } from './ubicaciones.controller';
import { UbicacionesService } from './ubicaciones.service';

const proveedorRepositorioUbicaciones: Provider = {
  provide: REPOSITORIO_UBICACIONES,
  useClass: UbicacionesTypeormRepositorio,
};

@Module({
  controllers: [UbicacionesController],
  providers: [
    UbicacionesService,
    UbicacionesTypeormRepositorio,
    proveedorRepositorioUbicaciones,
  ],
  exports: [UbicacionesService, REPOSITORIO_UBICACIONES],
})
export class UbicacionesModule {}

import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_BICICLETAS } from '../comun/constantes/tokens-repositorios';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';
import { BicicletasController } from './bicicletas.controller';
import { BicicletasMemoriaRepositorio } from './repositorios/bicicletas-memoria.repositorio';
import { BicicletasTypeormRepositorio } from './repositorios/bicicletas-typeorm.repositorio';
import { BicicletasService } from './bicicletas.service';

const proveedorRepositorioBicicletas: Provider = {
  provide: REPOSITORIO_BICICLETAS,
  useClass:
    obtenerModoDatos() === 'typeorm'
      ? BicicletasTypeormRepositorio
      : BicicletasMemoriaRepositorio,
};

@Module({
  controllers: [BicicletasController],
  providers: [
    BicicletasService,
    BicicletasMemoriaRepositorio,
    BicicletasTypeormRepositorio,
    proveedorRepositorioBicicletas,
  ],
  exports: [BicicletasService, REPOSITORIO_BICICLETAS],
})
export class BicicletasModule {}

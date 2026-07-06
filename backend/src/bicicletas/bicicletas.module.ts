import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_BICICLETAS } from '../comun/constantes/tokens-repositorios';
import { BicicletasController } from './bicicletas.controller';
import { BicicletasTypeormRepositorio } from './repositorios/bicicletas-typeorm.repositorio';
import { BicicletasService } from './bicicletas.service';

const proveedorRepositorioBicicletas: Provider = {
  provide: REPOSITORIO_BICICLETAS,
  useClass: BicicletasTypeormRepositorio,
};

@Module({
  controllers: [BicicletasController],
  providers: [
    BicicletasService,
    BicicletasTypeormRepositorio,
    proveedorRepositorioBicicletas,
  ],
  exports: [BicicletasService, REPOSITORIO_BICICLETAS],
})
export class BicicletasModule {}

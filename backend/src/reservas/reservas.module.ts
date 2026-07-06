import { Module, Provider } from '@nestjs/common';
import { BicicletasModule } from '../bicicletas/bicicletas.module';
import { REPOSITORIO_RESERVAS } from '../comun/constantes/tokens-repositorios';
import { ReservasController } from './reservas.controller';
import { ReservasTypeormRepositorio } from './repositorios/reservas-typeorm.repositorio';
import { ReservasService } from './reservas.service';

const proveedorRepositorioReservas: Provider = {
  provide: REPOSITORIO_RESERVAS,
  useClass: ReservasTypeormRepositorio,
};

@Module({
  imports: [BicicletasModule],
  controllers: [ReservasController],
  providers: [
    ReservasService,
    ReservasTypeormRepositorio,
    proveedorRepositorioReservas,
  ],
  exports: [ReservasService, REPOSITORIO_RESERVAS],
})
export class ReservasModule {}

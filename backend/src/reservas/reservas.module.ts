import { Module, Provider } from '@nestjs/common';
import { BicicletasModule } from '../bicicletas/bicicletas.module';
import { REPOSITORIO_RESERVAS } from '../comun/constantes/tokens-repositorios';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';
import { ReservasController } from './reservas.controller';
import { ReservasMemoriaRepositorio } from './repositorios/reservas-memoria.repositorio';
import { ReservasTypeormRepositorio } from './repositorios/reservas-typeorm.repositorio';
import { ReservasService } from './reservas.service';

const proveedorRepositorioReservas: Provider = {
  provide: REPOSITORIO_RESERVAS,
  useClass:
    obtenerModoDatos() === 'typeorm' ? ReservasTypeormRepositorio : ReservasMemoriaRepositorio,
};

@Module({
  imports: [BicicletasModule],
  controllers: [ReservasController],
  providers: [
    ReservasService,
    ReservasMemoriaRepositorio,
    ReservasTypeormRepositorio,
    proveedorRepositorioReservas,
  ],
  exports: [ReservasService, REPOSITORIO_RESERVAS],
})
export class ReservasModule {}

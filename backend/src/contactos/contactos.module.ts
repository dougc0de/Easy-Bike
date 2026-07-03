import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_CONTACTOS } from '../comun/constantes/tokens-repositorios';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';
import { ContactosController } from './contactos.controller';
import { ContactosService } from './contactos.service';
import { ContactosMemoriaRepositorio } from './repositorios/contactos-memoria.repositorio';
import { ContactosTypeormRepositorio } from './repositorios/contactos-typeorm.repositorio';

const proveedorRepositorioContactos: Provider = {
  provide: REPOSITORIO_CONTACTOS,
  useClass:
    obtenerModoDatos() === 'typeorm' ? ContactosTypeormRepositorio : ContactosMemoriaRepositorio,
};

@Module({
  controllers: [ContactosController],
  providers: [
    ContactosService,
    ContactosMemoriaRepositorio,
    ContactosTypeormRepositorio,
    proveedorRepositorioContactos,
  ],
  exports: [ContactosService, REPOSITORIO_CONTACTOS],
})
export class ContactosModule {}

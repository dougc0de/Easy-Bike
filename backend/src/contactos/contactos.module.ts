import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_CONTACTOS } from '../comun/constantes/tokens-repositorios';
import { ContactosController } from './contactos.controller';
import { ContactosService } from './contactos.service';
import { ContactosTypeormRepositorio } from './repositorios/contactos-typeorm.repositorio';

const proveedorRepositorioContactos: Provider = {
  provide: REPOSITORIO_CONTACTOS,
  useClass: ContactosTypeormRepositorio,
};

@Module({
  controllers: [ContactosController],
  providers: [
    ContactosService,
    ContactosTypeormRepositorio,
    proveedorRepositorioContactos,
  ],
  exports: [ContactosService, REPOSITORIO_CONTACTOS],
})
export class ContactosModule {}

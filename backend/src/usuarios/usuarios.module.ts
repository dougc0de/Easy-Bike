import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_USUARIOS } from '../comun/constantes/tokens-repositorios';
import { UsuariosController } from './usuarios.controller';
import { UsuariosTypeormRepositorio } from './repositorios/usuarios-typeorm.repositorio';
import { UsuariosService } from './usuarios.service';

const proveedorRepositorioUsuarios: Provider = {
  provide: REPOSITORIO_USUARIOS,
  useClass: UsuariosTypeormRepositorio,
};

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    UsuariosTypeormRepositorio,
    proveedorRepositorioUsuarios,
  ],
  exports: [UsuariosService, REPOSITORIO_USUARIOS],
})
export class UsuariosModule {}

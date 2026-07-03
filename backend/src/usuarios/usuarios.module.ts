import { Module, Provider } from '@nestjs/common';
import { REPOSITORIO_USUARIOS } from '../comun/constantes/tokens-repositorios';
import { obtenerModoDatos } from '../comun/utilidades/entorno.util';
import { UsuariosController } from './usuarios.controller';
import { UsuariosMemoriaRepositorio } from './repositorios/usuarios-memoria.repositorio';
import { UsuariosTypeormRepositorio } from './repositorios/usuarios-typeorm.repositorio';
import { UsuariosService } from './usuarios.service';

const proveedorRepositorioUsuarios: Provider = {
  provide: REPOSITORIO_USUARIOS,
  useClass: obtenerModoDatos() === 'typeorm' ? UsuariosTypeormRepositorio : UsuariosMemoriaRepositorio,
};

@Module({
  controllers: [UsuariosController],
  providers: [
    UsuariosService,
    UsuariosMemoriaRepositorio,
    UsuariosTypeormRepositorio,
    proveedorRepositorioUsuarios,
  ],
  exports: [UsuariosService, REPOSITORIO_USUARIOS],
})
export class UsuariosModule {}

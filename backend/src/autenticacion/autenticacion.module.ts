import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [JwtModule.register({}), UsuariosModule],
  controllers: [AutenticacionController],
  providers: [AutenticacionService, JwtAccessGuard, RolesGuard],
  exports: [AutenticacionService, JwtAccessGuard, RolesGuard, JwtModule],
})
export class AutenticacionModule {}

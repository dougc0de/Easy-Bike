import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../comun/enums/rol-usuario.enum';
import { ROLES_META_CLAVE } from '../decoradores/roles.decorator';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesPermitidos = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_META_CLAVE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesPermitidos?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: UsuarioAutenticado }>();

    if (!request.user) {
      throw new ForbiddenException('No se encontró un usuario autenticado para validar permisos.');
    }

    if (!rolesPermitidos.includes(request.user.role)) {
      throw new ForbiddenException('No tienes permisos para acceder a este recurso.');
    }

    return true;
  }
}

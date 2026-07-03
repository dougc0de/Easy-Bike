import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioAutenticado | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: UsuarioAutenticado }>();

    return request.user;
  },
);

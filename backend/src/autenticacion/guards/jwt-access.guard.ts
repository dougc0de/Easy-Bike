import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsuarioAutenticado } from '../interfaces/usuario-autenticado.interface';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: UsuarioAutenticado;
    }>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Debes iniciar sesión para continuar.');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const secret = this.configService.get<string>('JWT_SECRET')?.trim();

    if (!secret) {
      throw new UnauthorizedException('JWT_SECRET no está configurado en el backend.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('El token recibido no es un access token válido.');
      }

      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión expiró o el token es inválido.');
    }
  }
}

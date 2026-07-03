import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: RolUsuario;
  type: 'access' | 'refresh';
}

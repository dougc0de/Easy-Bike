import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export interface UsuarioAutenticado {
  userId: string;
  email: string;
  role: RolUsuario;
}

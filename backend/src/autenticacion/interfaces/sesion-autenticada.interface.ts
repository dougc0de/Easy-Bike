import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export interface SesionAutenticada {
  email: string;
  role: RolUsuario;
  loggedAt: string;
  name: string;
}

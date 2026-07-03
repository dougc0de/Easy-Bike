import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export interface Usuario {
  id: string;
  email: string;
  nombreCompleto: string;
  rol: RolUsuario;
  telefono: string | null;
  passwordHash: string | null;
  refreshTokenHash: string | null;
  activo: boolean;
  ultimoAccesoAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearUsuarioPersistencia {
  email: string;
  nombreCompleto: string;
  rol: RolUsuario;
  telefono?: string | null;
  passwordHash?: string | null;
  refreshTokenHash?: string | null;
  activo?: boolean;
  ultimoAccesoAt?: string | null;
}

export interface ActualizarUsuarioPersistencia {
  email?: string;
  nombreCompleto?: string;
  rol?: RolUsuario;
  telefono?: string | null;
  passwordHash?: string | null;
  refreshTokenHash?: string | null;
  activo?: boolean;
  ultimoAccesoAt?: string | null;
  updatedAt?: string;
}

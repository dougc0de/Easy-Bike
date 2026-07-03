import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export const ROLES_META_CLAVE = 'roles_permitidos_easy_bike';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_META_CLAVE, roles);

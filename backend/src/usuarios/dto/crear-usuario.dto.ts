import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export class CrearUsuarioDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MaxLength(140)
  nombreCompleto!: string;

  @IsEnum(RolUsuario)
  rol!: RolUsuario;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

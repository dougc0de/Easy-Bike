import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { LONGITUD_MINIMA_PASSWORD } from '../autenticacion.constantes';

export class RegistroDto {
  @IsString()
  @MaxLength(140)
  nombreCompleto!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(LONGITUD_MINIMA_PASSWORD)
  @MaxLength(120)
  password!: string;

  @IsString()
  @MinLength(LONGITUD_MINIMA_PASSWORD)
  @MaxLength(120)
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;
}

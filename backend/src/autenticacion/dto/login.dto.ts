import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { LONGITUD_MINIMA_PASSWORD } from '../autenticacion.constantes';

export class LoginDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(LONGITUD_MINIMA_PASSWORD)
  @MaxLength(120)
  password!: string;
}

import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoMensajeContacto } from '../../comun/enums/estado-mensaje-contacto.enum';

export class ActualizarContactoDto {
  @IsOptional()
  @IsString()
  @MaxLength(140)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  asunto?: string;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsEnum(EstadoMensajeContacto)
  estado?: EstadoMensajeContacto;
}

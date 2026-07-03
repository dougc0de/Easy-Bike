import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ActualizarUbicacionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titulo?: string;

  @IsOptional()
  @IsString()
  subtitulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  horario?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  etiquetaCta?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  urlExterna?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlImagen?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlEmbed?: string | null;
}

import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CrearUbicacionDto {
  @IsString()
  @MaxLength(120)
  titulo!: string;

  @IsString()
  subtitulo!: string;

  @IsString()
  @MaxLength(220)
  direccion!: string;

  @IsString()
  @MaxLength(120)
  horario!: string;

  @IsString()
  @MaxLength(80)
  etiquetaCta!: string;

  @IsUrl()
  @MaxLength(255)
  urlExterna!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlImagen?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlEmbed?: string | null;
}

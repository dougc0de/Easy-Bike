import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { DisponibilidadBicicleta } from '../../comun/enums/disponibilidad-bicicleta.enum';

export class ActualizarBicicletaDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  descripcionCorta?: string;

  @IsOptional()
  @IsString()
  detalle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  precio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  autonomia?: string;

  @IsOptional()
  @IsEnum(DisponibilidadBicicleta)
  disponibilidad?: DisponibilidadBicicleta;

  @IsOptional()
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/)
  colorAcento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  recomendadoPara?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  urlImagen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  textoAlternativoImagen?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

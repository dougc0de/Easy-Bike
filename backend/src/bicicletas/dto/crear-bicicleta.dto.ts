import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { DisponibilidadBicicleta } from '../../comun/enums/disponibilidad-bicicleta.enum';

export class CrearBicicletaDto {
  @IsString()
  @MaxLength(160)
  nombre!: string;

  @IsString()
  @MaxLength(100)
  categoria!: string;

  @IsString()
  @MaxLength(220)
  descripcionCorta!: string;

  @IsString()
  detalle!: string;

  @IsString()
  @MaxLength(80)
  precio!: string;

  @IsString()
  @MaxLength(80)
  autonomia!: string;

  @IsEnum(DisponibilidadBicicleta)
  disponibilidad!: DisponibilidadBicicleta;

  @IsString()
  @Matches(/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/)
  colorAcento!: string;

  @IsString()
  @MaxLength(160)
  recomendadoPara!: string;

  @IsString()
  @MaxLength(255)
  urlImagen!: string;

  @IsString()
  @MaxLength(180)
  textoAlternativoImagen!: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}

import { IsBooleanString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarBaseQueryDto } from '../../comun/dto/listar-base.query.dto';
import { DisponibilidadBicicleta } from '../../comun/enums/disponibilidad-bicicleta.enum';

export class ListarBicicletasQueryDto extends ListarBaseQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @IsOptional()
  @IsEnum(DisponibilidadBicicleta)
  disponibilidad?: DisponibilidadBicicleta;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  busqueda?: string;

  @IsOptional()
  @IsBooleanString()
  soloActivas?: string;
}

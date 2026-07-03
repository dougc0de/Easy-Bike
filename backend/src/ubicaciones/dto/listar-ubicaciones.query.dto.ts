import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarBaseQueryDto } from '../../comun/dto/listar-base.query.dto';

export class ListarUbicacionesQueryDto extends ListarBaseQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  direccion?: string;
}

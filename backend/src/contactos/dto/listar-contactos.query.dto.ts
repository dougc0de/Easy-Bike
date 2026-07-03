import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarBaseQueryDto } from '../../comun/dto/listar-base.query.dto';
import { EstadoMensajeContacto } from '../../comun/enums/estado-mensaje-contacto.enum';

export class ListarContactosQueryDto extends ListarBaseQueryDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsEnum(EstadoMensajeContacto)
  estado?: EstadoMensajeContacto;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  asunto?: string;
}

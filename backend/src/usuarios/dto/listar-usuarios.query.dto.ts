import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarBaseQueryDto } from '../../comun/dto/listar-base.query.dto';
import { RolUsuario } from '../../comun/enums/rol-usuario.enum';

export class ListarUsuariosQueryDto extends ListarBaseQueryDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  nombre?: string;
}

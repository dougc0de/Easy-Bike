import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListarBaseQueryDto } from '../../comun/dto/listar-base.query.dto';
import { EstadoReserva } from '../../comun/enums/estado-reserva.enum';
import { OrigenReserva } from '../../comun/enums/origen-reserva.enum';

export class ListarReservasQueryDto extends ListarBaseQueryDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  correoCliente?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bicicletaId?: string;

  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @IsOptional()
  @IsEnum(OrigenReserva)
  origen?: OrigenReserva;
}

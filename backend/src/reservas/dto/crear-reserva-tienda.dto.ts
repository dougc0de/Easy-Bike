import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CrearReservaDto } from './crear-reserva.dto';

export class CrearReservaTiendaDto extends CrearReservaDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  handledByUserId?: string;
}

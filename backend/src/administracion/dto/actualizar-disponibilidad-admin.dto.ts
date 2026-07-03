import { IsEnum } from 'class-validator';
import { DisponibilidadBicicleta } from '../../comun/enums/disponibilidad-bicicleta.enum';

export class ActualizarDisponibilidadAdminDto {
  @IsEnum(DisponibilidadBicicleta)
  disponibilidad!: DisponibilidadBicicleta;
}

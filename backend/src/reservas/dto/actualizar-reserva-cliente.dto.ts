import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ActualizarReservaClienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(140)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsUUID()
  bikeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  pickupPoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  notes?: string;
}

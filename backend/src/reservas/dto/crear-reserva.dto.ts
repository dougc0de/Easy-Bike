import { IsEmail, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CrearReservaDto {
  @IsString()
  @MaxLength(140)
  fullName!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsUUID()
  bikeId!: string;

  @IsString()
  @MaxLength(10)
  date!: string;

  @IsString()
  @MaxLength(5)
  time!: string;

  @IsInt()
  @Min(1)
  duration!: number;

  @IsString()
  @MaxLength(120)
  pickupPoint!: string;

  @IsString()
  @MaxLength(800)
  notes!: string;
}

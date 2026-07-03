import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CrearContactoDto {
  @IsString()
  @MaxLength(140)
  nombre!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MaxLength(180)
  asunto!: string;

  @IsString()
  mensaje!: string;
}

import { Controller, Get } from '@nestjs/common';
import { SaludService } from './salud.service';

@Controller('salud')
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  @Get()
  obtenerEstadoGeneral() {
    return this.saludService.obtenerEstadoGeneral();
  }

  @Get('base-datos')
  obtenerEstadoBaseDatos() {
    return this.saludService.obtenerEstadoBaseDatos();
  }
}

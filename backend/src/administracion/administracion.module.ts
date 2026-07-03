import { Module } from '@nestjs/common';
import { BicicletasModule } from '../bicicletas/bicicletas.module';
import { ReservasModule } from '../reservas/reservas.module';
import { AdministracionController } from './administracion.controller';
import { AdministracionService } from './administracion.service';

@Module({
  imports: [BicicletasModule, ReservasModule],
  controllers: [AdministracionController],
  providers: [AdministracionService],
})
export class AdministracionModule {}

import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministracionModule } from './administracion/administracion.module';
import { BaseDatosModule } from './base-datos/base-datos.module';
import { BicicletasModule } from './bicicletas/bicicletas.module';
import { ContactosModule } from './contactos/contactos.module';
import { ReservasModule } from './reservas/reservas.module';
import { SaludModule } from './salud/salud.module';
import { UbicacionesModule } from './ubicaciones/ubicaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BaseDatosModule.registrar(),
    AutenticacionModule,
    SaludModule,
    UsuariosModule,
    BicicletasModule,
    ReservasModule,
    ContactosModule,
    UbicacionesModule,
    AdministracionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

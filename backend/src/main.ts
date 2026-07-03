import 'dotenv/config';
import { setDefaultResultOrder } from 'node:dns';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { BaseDatosService } from './base-datos/base-datos.service';
import {
  obtenerResumenConfiguracionArranque,
  validarConfiguracionCriticaProduccion,
} from './comun/utilidades/entorno.util';

setDefaultResultOrder('ipv4first');

async function bootstrap() {
  validarConfiguracionCriticaProduccion();

  const logger = new Logger('Bootstrap');
  const resumenArranque = obtenerResumenConfiguracionArranque();

  logger.log(
    `Modo de datos configurado: ${resumenArranque.modoDatos}. Producción: ${resumenArranque.produccion ? 'sí' : 'no'}.`,
  );
  logger.log(
    `Conexión de base de datos seleccionada: ${resumenArranque.tipoConexionBaseDatos}.`,
  );
  logger.log(`Orígenes CORS permitidos: ${resumenArranque.origenesCors.join(', ')}.`);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const baseDatosService = app.get(BaseDatosService);
  const puerto = Number(configService.get<string>('PORT')?.trim() || '3000');
  const origins = resumenArranque.origenesCors;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('');

  await app.listen(puerto, '0.0.0.0');

  logger.log(
    `Backend escuchando en 0.0.0.0:${puerto} con conexión ${baseDatosService.obtenerTipoConexionConfigurada()}.`,
  );
}
bootstrap();

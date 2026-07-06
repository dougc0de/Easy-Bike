import { Global, INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AdministracionModule } from '../src/administracion/administracion.module';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { AutenticacionModule } from '../src/autenticacion/autenticacion.module';
import { BaseDatosService } from '../src/base-datos/base-datos.service';
import { BicicletasModule } from '../src/bicicletas/bicicletas.module';
import {
  REPOSITORIO_BICICLETAS,
  REPOSITORIO_CONTACTOS,
  REPOSITORIO_RESERVAS,
  REPOSITORIO_UBICACIONES,
  REPOSITORIO_USUARIOS,
} from '../src/comun/constantes/tokens-repositorios';
import { ContactosModule } from '../src/contactos/contactos.module';
import { ReservasModule } from '../src/reservas/reservas.module';
import { SaludModule } from '../src/salud/salud.module';
import { UbicacionesModule } from '../src/ubicaciones/ubicaciones.module';
import { UsuariosModule } from '../src/usuarios/usuarios.module';
import {
  createTestRepositoryBundle,
  TestRepositoryBundle,
} from './support/in-memory-repositories';

process.env.MODO_DATOS = 'typeorm';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-pruebas-easy-bike';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret-pruebas-easy-bike';

const baseDatosServicePrueba: Pick<
  BaseDatosService,
  'obtenerModo' | 'estaConfigurada' | 'estaInicializada' | 'obtenerTipoConexionConfigurada'
> = {
  obtenerModo: () => 'typeorm',
  estaConfigurada: () => true,
  estaInicializada: () => true,
  obtenerTipoConexionConfigurada: () => 'pooler',
};

@Global()
@Module({
  providers: [
    {
      provide: BaseDatosService,
      useValue: baseDatosServicePrueba,
    },
  ],
  exports: [BaseDatosService],
})
class TestBaseDatosModule {}

describe('Easy Bike API (e2e)', () => {
  let app: INestApplication<App>;
  let repositorios: TestRepositoryBundle;

  beforeEach(async () => {
    repositorios = await createTestRepositoryBundle();

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TestBaseDatosModule,
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
      .overrideProvider(REPOSITORIO_USUARIOS)
      .useValue(repositorios.usuariosRepo)
      .overrideProvider(REPOSITORIO_BICICLETAS)
      .useValue(repositorios.bicicletasRepo)
      .overrideProvider(REPOSITORIO_RESERVAS)
      .useValue(repositorios.reservasRepo)
      .overrideProvider(REPOSITORIO_CONTACTOS)
      .useValue(repositorios.contactosRepo)
      .overrideProvider(REPOSITORIO_UBICACIONES)
      .useValue(repositorios.ubicacionesRepo);

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  async function iniciarSesion(email: string, password: string) {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    return {
      accessToken: respuesta.body.accessToken as string,
      cookie: (respuesta.headers['set-cookie'] ?? [])[0] as string,
      session: respuesta.body.session,
    };
  }

  it('GET / devuelve metadatos de la API', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe('Easy Bike API');
        expect(body.docs.salud).toBe('/salud');
      });
  });

  it('GET /salud/base-datos reporta conexión typeorm activa', () => {
    return request(app.getHttpServer())
      .get('/salud/base-datos')
      .expect(200)
      .expect(({ body }) => {
        expect(body.mode).toBe('typeorm');
        expect(body.status).toBe('conectada');
        expect(body.connectionType).toBe('pooler');
        expect(body.provider).toBe('supabase-postgres');
      });
  });

  it('registro, login, refresh y logout funcionan con JWT propio', async () => {
    await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nombreCompleto: 'Nuevo Cliente',
        email: 'nuevo@easybike.com',
        password: 'Cliente123!',
        confirmPassword: 'Cliente123!',
      })
      .expect(201)
      .expect(({ body, headers }) => {
        expect(body.success).toBe(true);
        expect(body.accessToken).toBeTruthy();
        expect(body.session.role).toBe('cliente');
        expect((headers['set-cookie'] ?? [])[0]).toContain('easybike_refresh_token=');
      });

    await request(app.getHttpServer())
      .post('/auth/registro')
      .send({
        nombreCompleto: 'Duplicado',
        email: 'nuevo@easybike.com',
        password: 'Cliente123!',
        confirmPassword: 'Cliente123!',
      })
      .expect(409);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nuevo@easybike.com',
        password: 'error123',
      })
      .expect(401);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nuevo@easybike.com',
        password: 'Cliente123!',
      })
      .expect(200);

    const accessToken = login.body.accessToken as string;
    const refreshCookie = (login.headers['set-cookie'] ?? [])[0] as string;

    await request(app.getHttpServer())
      .get('/auth/perfil')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.session.email).toBe('nuevo@easybike.com');
        expect(body.session.role).toBe('cliente');
      });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshCookie)
      .expect(200)
      .expect(({ body, headers }) => {
        expect(body.accessToken).toBeTruthy();
        expect(body.session.email).toBe('nuevo@easybike.com');
        expect((headers['set-cookie'] ?? [])[0]).toContain('easybike_refresh_token=');
      });

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', refreshCookie)
      .expect(200)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
      });

    await request(app.getHttpServer()).post('/auth/refresh').set('Cookie', refreshCookie).expect(401);
  });

  it('usuarios CRUD exige admin autenticado y rechaza campos extra', async () => {
    const admin = await iniciarSesion('admin@easybike.com', 'Admin123!');

    await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        email: 'nuevo@easybike.com',
        nombreCompleto: 'Nuevo Usuario',
        rol: 'cliente',
        telefono: '8888-9999',
        extra: 'no-permitido',
      })
      .expect(400);

    const creado = await request(app.getHttpServer())
      .post('/usuarios')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        email: 'nuevo@easybike.com',
        nombreCompleto: 'Nuevo Usuario',
        rol: 'cliente',
        telefono: '8888-9999',
      })
      .expect(201);

    const usuarioId = creado.body.id;

    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .query({ email: 'nuevo@easybike.com' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveLength(1);
        expect(body[0].passwordHash).toBeUndefined();
      });

    await request(app.getHttpServer())
      .patch(`/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ nombreCompleto: 'Usuario Actualizado', activo: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body.nombreCompleto).toBe('Usuario Actualizado');
        expect(body.activo).toBe(false);
      });

    await request(app.getHttpServer())
      .delete(`/usuarios/${usuarioId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
  });

  it('bicicletas, admin y roles protegidos funcionan correctamente', async () => {
    const admin = await iniciarSesion('admin@easybike.com', 'Admin123!');
    const cliente = await iniciarSesion('cliente@easybike.com', 'Cliente123!');

    await request(app.getHttpServer())
      .get('/admin/resumen')
      .set('Authorization', `Bearer ${cliente.accessToken}`)
      .expect(403);

    const creada = await request(app.getHttpServer())
      .post('/bicicletas')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        nombre: 'Bici Demo',
        categoria: 'Urbana',
        descripcionCorta: 'Compacta para ciudad.',
        detalle: 'Detalle de bicicleta demo.',
        precio: 'Desde $19 / 24 h',
        autonomia: 'Hasta 30 km',
        disponibilidad: 'Disponible',
        colorAcento: '#22a6b3',
        recomendadoPara: 'Recorridos cortos.',
        urlImagen: '/images/demo.jpg',
        textoAlternativoImagen: 'Bici Demo',
        activo: true,
      })
      .expect(201);

    const bicicletaId = creada.body.id;

    await request(app.getHttpServer())
      .patch(`/admin/bicicletas/${bicicletaId}/disponibilidad`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ disponibilidad: 'Últimas unidades' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.availability).toBe('Últimas unidades');
      });

    await request(app.getHttpServer())
      .get('/admin/bicicletas/disponibilidad-por-categoria')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  it('contactos públicos y ubicaciones públicas conviven con endpoints admin protegidos', async () => {
    const admin = await iniciarSesion('admin@easybike.com', 'Admin123!');

    await request(app.getHttpServer())
      .post('/contactos')
      .send({
        nombre: 'Diego',
        email: 'diego@correo.com',
        asunto: 'Consulta',
        mensaje: 'Necesito más información.',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.ticket).toContain('MSG-');
      });

    await request(app.getHttpServer())
      .get('/ubicaciones/configuracion-mapa')
      .expect(200)
      .expect(({ body }) => {
        expect(body.title).toBe('Encuéntranos fácilmente');
        expect(body.contactPhone).toBe('8913-4973');
        expect(body.contactEmail).toBe('hola@easybike.com');
        expect(body.externalUrl).toContain('google.com/maps');
      });

    await request(app.getHttpServer())
      .get('/contactos')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/ubicaciones')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
  });

  it('reservas de cliente y reserva en tienda admin respetan autenticación y reglas', async () => {
    const cliente = await iniciarSesion('cliente@easybike.com', 'Cliente123!');
    const admin = await iniciarSesion('admin@easybike.com', 'Admin123!');

    await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${cliente.accessToken}`)
      .send({
        fullName: 'Cliente Inválido',
        email: 'intruso@correo.com',
        phone: '8111-1111',
        bikeId: 'not-a-uuid',
        date: '2026-07-10',
        time: '10:00',
        duration: 24,
        pickupPoint: 'Punto Central Easy Bike',
        notes: '',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${cliente.accessToken}`)
      .send({
        fullName: 'Cliente Inválido',
        email: 'intruso@correo.com',
        phone: '8111-1111',
        bikeId: '6d2feecb-1558-4a18-832a-0d5517e83001',
        date: '2026-07-10',
        time: '21:30',
        duration: 24,
        pickupPoint: 'Punto Central Easy Bike',
        notes: '',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${cliente.accessToken}`)
      .send({
        fullName: 'Cliente Válido',
        email: 'otro@correo.com',
        phone: '8222-2222',
        bikeId: '6d2feecb-1558-4a18-832a-0d5517e83001',
        date: '2026-07-10',
        time: '10:00',
        duration: 24,
        pickupPoint: 'Punto Central Easy Bike',
        notes: 'Reserva e2e.',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.reservation.customerEmail).toBe('cliente@easybike.com');
        expect(body.voucher.paymentMethod).toBe('Pago físico al retirar la bicicleta');
      });

    await request(app.getHttpServer())
      .get('/reservas')
      .set('Authorization', `Bearer ${cliente.accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body.every((item: { customerEmail: string }) => item.customerEmail === 'cliente@easybike.com')).toBe(
          true,
        );
      });

    await request(app.getHttpServer())
      .get('/admin/resumen')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.totalBicicletas).toBeGreaterThan(0);
        expect(body.reservasRegistradas).toBeGreaterThan(0);
      });

    await request(app.getHttpServer())
      .post('/admin/reservas-en-tienda')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        fullName: 'Reserva Tienda',
        email: 'tienda@correo.com',
        phone: '8333-3333',
        bikeId: '7d2feecb-1558-4a18-832a-0d5517e83002',
        date: '2026-07-11',
        time: '11:30',
        duration: 8,
        pickupPoint: 'Punto Central Easy Bike',
        notes: 'Atendida en tienda.',
        handledByUserId: 'spoof',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.reservation.origin).toBe('admin-store');
      });
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});

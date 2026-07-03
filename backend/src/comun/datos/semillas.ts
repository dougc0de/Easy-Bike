import { DisponibilidadBicicleta } from '../enums/disponibilidad-bicicleta.enum';
import { EstadoReserva } from '../enums/estado-reserva.enum';
import { MetodoPagoReserva } from '../enums/metodo-pago.enum';
import { OrigenReserva } from '../enums/origen-reserva.enum';
import { RolUsuario } from '../enums/rol-usuario.enum';
import { Bicicleta } from '../../bicicletas/interfaces/bicicleta.interface';
import { MensajeContacto } from '../../contactos/interfaces/mensaje-contacto.interface';
import { Reserva } from '../../reservas/interfaces/reserva.interface';
import { ConfiguracionUbicacion } from '../../ubicaciones/interfaces/configuracion-ubicacion.interface';
import { Usuario } from '../../usuarios/interfaces/usuario.interface';

export const USUARIOS_SEMILLA: Usuario[] = [
  {
    id: '0f2e9953-3d20-478f-a1c4-8ea5db5d1001',
    email: 'cliente@easybike.com',
    nombreCompleto: 'Valeria Torres',
    rol: RolUsuario.CLIENTE,
    telefono: '+505 8913-4973',
    passwordHash:
      'scrypt$2d35ece34f6104377577ae07a40fa339$31fc9c9103ab03126ae9f286f1137b9e0f0247dcf6099f1b5113b3bbfb688301617f8cb3d5ade43a61edff4f9b231148389c22f2e0f14ce544580b44810890a5',
    refreshTokenHash: null,
    activo: true,
    ultimoAccesoAt: null,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-07-01T09:00:00.000Z',
  },
  {
    id: '9e3d4af9-2d37-4af3-a703-443bcd741002',
    email: 'admin@easybike.com',
    nombreCompleto: 'Carlos Mendoza',
    rol: RolUsuario.ADMINISTRACION,
    telefono: '+505 8913-0000',
    passwordHash:
      'scrypt$e843dd2a2777ccb038f4e80b7f46f166$88c08f446280628ee78b717283e587cd0edc4af16857b0d6ae558c99b902a0cc6506430a065f73e1c996d740ce941f3d9c7b00eed8e6d0459c1f6cc72e06ae3a',
    refreshTokenHash: null,
    activo: true,
    ultimoAccesoAt: null,
    createdAt: '2026-07-01T09:10:00.000Z',
    updatedAt: '2026-07-01T09:10:00.000Z',
  },
  {
    id: '4fd0f5e1-cf37-4f0a-aef1-93732a431003',
    email: 'andrea@easybike.com',
    nombreCompleto: 'Andrea Ruiz',
    rol: RolUsuario.CLIENTE,
    telefono: '+505 8913-2222',
    passwordHash:
      'scrypt$33cd791b8c698b3eb62b0ea76eb6a564$d4f9ed9e42e76fb3f50bf23a00b513a41acd46da60464284ea26bf3f8ecaeefa4e55cb45e4627e87b9961a3a8b4b1a96103ae269e76088c4bc8886ff1cee3127',
    refreshTokenHash: null,
    activo: true,
    ultimoAccesoAt: null,
    createdAt: '2026-07-01T09:20:00.000Z',
    updatedAt: '2026-07-01T09:20:00.000Z',
  },
];

export const BICICLETAS_SEMILLA: Bicicleta[] = [
  {
    id: '6d2feecb-1558-4a18-832a-0d5517e83001',
    nombre: 'Bicicleta eléctrica urbana',
    categoria: 'Urbana',
    descripcionCorta: 'Ligera, estable y perfecta para moverte entre clases, trabajo y recados.',
    detalle:
      'Perfecta para desplazamientos en la ciudad, cómoda, práctica y fácil de manejar. Ideal si quieres un recorrido ágil con postura relajada.',
    precio: 'Desde $22 / 24 h',
    autonomia: 'Hasta 45 km',
    disponibilidad: DisponibilidadBicicleta.DISPONIBLE,
    colorAcento: '#f28705',
    recomendadoPara: 'Recorridos diarios y traslados rápidos.',
    urlImagen: '/images/carruselBici1.jpg',
    textoAlternativoImagen: 'Bicicleta eléctrica urbana Easy Bike',
    activo: true,
    createdAt: '2026-07-01T10:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: '7d2feecb-1558-4a18-832a-0d5517e83002',
    nombre: 'City Flow plegable',
    categoria: 'Plegable',
    descripcionCorta: 'Compacta para departamentos, oficinas y usuarios que combinan trayectos.',
    detalle:
      'Su diseño plegable la hace ideal para usuarios que necesitan ahorrar espacio y combinar movilidad con transporte público.',
    precio: 'Desde $25 / 24 h',
    autonomia: 'Hasta 35 km',
    disponibilidad: DisponibilidadBicicleta.ULTIMAS_UNIDADES,
    colorAcento: '#1b7f8f',
    recomendadoPara: 'Espacios reducidos y trayectos mixtos.',
    urlImagen: '/images/carruselBici2-BicicletaElectricaPlegable.jpg',
    textoAlternativoImagen: 'Bicicleta plegable City Flow Easy Bike',
    activo: true,
    createdAt: '2026-07-01T10:05:00.000Z',
    updatedAt: '2026-07-01T10:05:00.000Z',
  },
  {
    id: '8d2feecb-1558-4a18-832a-0d5517e83003',
    nombre: 'Terra X adventure',
    categoria: 'Todoterreno',
    descripcionCorta: 'Construida para superficies irregulares y rutas más largas de fin de semana.',
    detalle:
      'Ofrece mayor soporte, llantas robustas y un perfil más aventurero para quienes quieren una bici eléctrica versátil.',
    precio: 'Desde $31 / 24 h',
    autonomia: 'Hasta 55 km',
    disponibilidad: DisponibilidadBicicleta.DISPONIBLE,
    colorAcento: '#18362f',
    recomendadoPara: 'Aventura ligera y rutas urbanas exigentes.',
    urlImagen: '/images/carruselBici2.jpg',
    textoAlternativoImagen: 'Bicicleta todoterreno Terra X Easy Bike',
    activo: true,
    createdAt: '2026-07-01T10:10:00.000Z',
    updatedAt: '2026-07-01T10:10:00.000Z',
  },
  {
    id: '9d2feecb-1558-4a18-832a-0d5517e83004',
    nombre: 'Swift Comfort',
    categoria: 'Confort',
    descripcionCorta: 'Una opción cómoda, estable y con postura alta para trayectos relajados.',
    detalle:
      'Pensada para quienes priorizan confort, seguridad y una experiencia muy amigable al conducir por la ciudad.',
    precio: 'Desde $27 / 24 h',
    autonomia: 'Hasta 40 km',
    disponibilidad: DisponibilidadBicicleta.PROXIMAMENTE,
    colorAcento: '#53b9cc',
    recomendadoPara: 'Usuarios primerizos y trayectos tranquilos.',
    urlImagen: '/images/carruselBici1.jpg',
    textoAlternativoImagen: 'Bicicleta confort Swift Comfort Easy Bike',
    activo: true,
    createdAt: '2026-07-01T10:15:00.000Z',
    updatedAt: '2026-07-01T10:15:00.000Z',
  },
];

export const RESERVAS_SEMILLA: Reserva[] = [
  {
    id: 'aa2feecb-1558-4a18-832a-0d5517e83001',
    nombreCliente: 'Valeria Torres',
    correoCliente: 'cliente@easybike.com',
    telefonoCliente: '+505 8913-4973',
    bicicletaId: '6d2feecb-1558-4a18-832a-0d5517e83001',
    nombreBicicleta: 'Bicicleta eléctrica urbana',
    fechaReserva: '2026-07-04',
    horaReserva: '09:00',
    duracionHoras: 24,
    puntoRecojo: 'Punto Central Easy Bike',
    notas: null,
    monto: 22,
    estado: EstadoReserva.PENDIENTE_DE_ENTREGA,
    codigoVoucher: 'RSV-URBANA-2401',
    metodoPago: MetodoPagoReserva.PAGO_FISICO,
    origen: OrigenReserva.CLIENTE_WEB,
    atendidaPorUsuarioId: null,
    createdAt: '2026-07-01T09:20:00.000Z',
    updatedAt: '2026-07-01T09:20:00.000Z',
  },
  {
    id: 'bb2feecb-1558-4a18-832a-0d5517e83002',
    nombreCliente: 'Valeria Torres',
    correoCliente: 'cliente@easybike.com',
    telefonoCliente: '+505 8913-4973',
    bicicletaId: '8d2feecb-1558-4a18-832a-0d5517e83003',
    nombreBicicleta: 'Terra X adventure',
    fechaReserva: '2026-06-24',
    horaReserva: '10:30',
    duracionHoras: 8,
    puntoRecojo: 'Punto Central Easy Bike',
    notas: 'Reserva histórica de prueba.',
    monto: 31,
    estado: EstadoReserva.COMPLETADA,
    codigoVoucher: 'RSV-TERRA-1836',
    metodoPago: MetodoPagoReserva.PAGO_FISICO,
    origen: OrigenReserva.CLIENTE_WEB,
    atendidaPorUsuarioId: null,
    createdAt: '2026-06-22T14:05:00.000Z',
    updatedAt: '2026-06-22T14:05:00.000Z',
  },
  {
    id: 'cc2feecb-1558-4a18-832a-0d5517e83003',
    nombreCliente: 'Andrea Ruiz',
    correoCliente: 'andrea@easybike.com',
    telefonoCliente: '+505 8913-2222',
    bicicletaId: '7d2feecb-1558-4a18-832a-0d5517e83002',
    nombreBicicleta: 'City Flow plegable',
    fechaReserva: '2026-07-02',
    horaReserva: '15:00',
    duracionHoras: 4,
    puntoRecojo: 'Punto Central Easy Bike',
    notas: 'Atención administrativa de prueba.',
    monto: 25,
    estado: EstadoReserva.ACTIVA,
    codigoVoucher: 'RSV-CITY-7824',
    metodoPago: MetodoPagoReserva.PAGO_FISICO,
    origen: OrigenReserva.ADMIN_TIENDA,
    atendidaPorUsuarioId: '9e3d4af9-2d37-4af3-a703-443bcd741002',
    createdAt: '2026-06-30T16:10:00.000Z',
    updatedAt: '2026-06-30T16:10:00.000Z',
  },
];

export const MENSAJES_CONTACTO_SEMILLA: MensajeContacto[] = [];

export const UBICACIONES_SEMILLA: ConfiguracionUbicacion[] = [
  {
    id: 'dd2feecb-1558-4a18-832a-0d5517e83001',
    titulo: 'Encuéntranos fácilmente',
    subtitulo:
      'Este bloque ya queda listo para insertar Google Maps desde frontend cuando backend entregue la URL o configuración final.',
    direccion: 'Iglesia El Calvario, 2 cuadras al sur, en el Barrio El Calvario, León.',
    horario: 'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
    etiquetaCta: 'Abrir en Google Maps',
    urlExterna:
      'https://www.google.com/maps/search/?api=1&query=12%C2%B026%2706.8%22N%2086%C2%B052%2723.2%22W',
    urlImagen: '/images/map.jpg',
    urlEmbed: null,
    createdAt: '2026-07-01T11:00:00.000Z',
    updatedAt: '2026-07-01T11:00:00.000Z',
  },
];

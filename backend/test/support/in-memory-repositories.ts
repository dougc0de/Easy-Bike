import { randomUUID } from 'crypto';
import { ActualizarBicicletaDto } from '../../src/bicicletas/dto/actualizar-bicicleta.dto';
import { CrearBicicletaDto } from '../../src/bicicletas/dto/crear-bicicleta.dto';
import { ListarBicicletasQueryDto } from '../../src/bicicletas/dto/listar-bicicletas.query.dto';
import { Bicicleta } from '../../src/bicicletas/interfaces/bicicleta.interface';
import { RepositorioBicicletas } from '../../src/bicicletas/repositorios/bicicletas.repositorio';
import { DisponibilidadBicicleta } from '../../src/comun/enums/disponibilidad-bicicleta.enum';
import { EstadoMensajeContacto } from '../../src/comun/enums/estado-mensaje-contacto.enum';
import { EstadoReserva } from '../../src/comun/enums/estado-reserva.enum';
import { MetodoPagoReserva } from '../../src/comun/enums/metodo-pago.enum';
import { OrigenReserva } from '../../src/comun/enums/origen-reserva.enum';
import { RolUsuario } from '../../src/comun/enums/rol-usuario.enum';
import { generarHashSeguro } from '../../src/comun/utilidades/seguridad.util';
import { ActualizarContactoDto } from '../../src/contactos/dto/actualizar-contacto.dto';
import { CrearContactoDto } from '../../src/contactos/dto/crear-contacto.dto';
import { ListarContactosQueryDto } from '../../src/contactos/dto/listar-contactos.query.dto';
import { MensajeContacto } from '../../src/contactos/interfaces/mensaje-contacto.interface';
import { RepositorioContactos } from '../../src/contactos/repositorios/contactos.repositorio';
import { ListarReservasQueryDto } from '../../src/reservas/dto/listar-reservas.query.dto';
import { Reserva } from '../../src/reservas/interfaces/reserva.interface';
import { RepositorioReservas } from '../../src/reservas/repositorios/reservas.repositorio';
import { ActualizarUbicacionDto } from '../../src/ubicaciones/dto/actualizar-ubicacion.dto';
import { CrearUbicacionDto } from '../../src/ubicaciones/dto/crear-ubicacion.dto';
import { ListarUbicacionesQueryDto } from '../../src/ubicaciones/dto/listar-ubicaciones.query.dto';
import { ConfiguracionUbicacion } from '../../src/ubicaciones/interfaces/configuracion-ubicacion.interface';
import { RepositorioUbicaciones } from '../../src/ubicaciones/repositorios/ubicaciones.repositorio';
import { ListarUsuariosQueryDto } from '../../src/usuarios/dto/listar-usuarios.query.dto';
import {
  ActualizarUsuarioPersistencia,
  CrearUsuarioPersistencia,
  Usuario,
} from '../../src/usuarios/interfaces/usuario.interface';
import { RepositorioUsuarios } from '../../src/usuarios/repositorios/usuarios.repositorio';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function now() {
  return new Date().toISOString();
}

function paginate<T>(items: T[], offset = 0, limit = 50) {
  return items.slice(offset, offset + limit);
}

class InMemoryUsuariosRepository implements RepositorioUsuarios {
  private readonly usuarios: Usuario[];

  constructor(initialData: Usuario[]) {
    this.usuarios = clone(initialData);
  }

  async listar(query: ListarUsuariosQueryDto): Promise<Usuario[]> {
    const email = query.email?.trim().toLowerCase();
    const nombre = query.nombre?.trim().toLowerCase();

    const filtrados = this.usuarios.filter((usuario) => {
      if (email && usuario.email.toLowerCase() !== email) return false;
      if (query.rol && usuario.rol !== query.rol) return false;
      if (nombre && !usuario.nombreCompleto.toLowerCase().includes(nombre)) return false;

      return true;
    });

    return paginate(filtrados, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<Usuario | null> {
    return this.usuarios.find((usuario) => usuario.id === id) ?? null;
  }

  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    return this.usuarios.find((usuario) => usuario.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async crear(dto: CrearUsuarioPersistencia): Promise<Usuario> {
    const marcaTiempo = now();
    const usuario: Usuario = {
      id: randomUUID(),
      email: dto.email.trim().toLowerCase(),
      nombreCompleto: dto.nombreCompleto.trim(),
      rol: dto.rol,
      telefono: dto.telefono?.trim() || null,
      passwordHash: dto.passwordHash ?? null,
      refreshTokenHash: dto.refreshTokenHash ?? null,
      activo: dto.activo ?? true,
      ultimoAccesoAt: dto.ultimoAccesoAt ?? null,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.usuarios.push(usuario);

    return usuario;
  }

  async actualizar(id: string, dto: ActualizarUsuarioPersistencia): Promise<Usuario | null> {
    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.usuarios[indice];
    const actualizado: Usuario = {
      ...actual,
      email: dto.email?.trim().toLowerCase() ?? actual.email,
      nombreCompleto: dto.nombreCompleto?.trim() ?? actual.nombreCompleto,
      rol: dto.rol ?? actual.rol,
      telefono: dto.telefono === undefined ? actual.telefono : dto.telefono?.trim() || null,
      passwordHash: dto.passwordHash === undefined ? actual.passwordHash : dto.passwordHash,
      refreshTokenHash:
        dto.refreshTokenHash === undefined ? actual.refreshTokenHash : dto.refreshTokenHash,
      activo: dto.activo ?? actual.activo,
      ultimoAccesoAt: dto.ultimoAccesoAt === undefined ? actual.ultimoAccesoAt : dto.ultimoAccesoAt,
      updatedAt: dto.updatedAt ?? now(),
    };

    this.usuarios[indice] = actualizado;

    return actualizado;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return false;
    }

    this.usuarios.splice(indice, 1);
    return true;
  }
}

class InMemoryBicicletasRepository implements RepositorioBicicletas {
  private readonly bicicletas: Bicicleta[];

  constructor(initialData: Bicicleta[]) {
    this.bicicletas = clone(initialData);
  }

  async listar(query: ListarBicicletasQueryDto): Promise<Bicicleta[]> {
    const busqueda = query.busqueda?.trim().toLowerCase();
    const categoria = query.categoria?.trim().toLowerCase();
    const soloActivas = query.soloActivas === 'true';

    const filtradas = this.bicicletas.filter((bicicleta) => {
      if (categoria && bicicleta.categoria.toLowerCase() !== categoria) return false;
      if (query.disponibilidad && bicicleta.disponibilidad !== query.disponibilidad) return false;
      if (soloActivas && !bicicleta.activo) return false;

      if (busqueda) {
        const texto = [
          bicicleta.nombre,
          bicicleta.categoria,
          bicicleta.descripcionCorta,
          bicicleta.detalle,
          bicicleta.recomendadoPara,
        ]
          .join(' ')
          .toLowerCase();

        if (!texto.includes(busqueda)) return false;
      }

      return true;
    });

    return paginate(filtradas, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<Bicicleta | null> {
    return this.bicicletas.find((bicicleta) => bicicleta.id === id) ?? null;
  }

  async crear(dto: CrearBicicletaDto): Promise<Bicicleta> {
    const marcaTiempo = now();
    const bicicleta: Bicicleta = {
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      categoria: dto.categoria.trim(),
      descripcionCorta: dto.descripcionCorta.trim(),
      detalle: dto.detalle.trim(),
      precio: dto.precio.trim(),
      autonomia: dto.autonomia.trim(),
      disponibilidad: dto.disponibilidad,
      colorAcento: dto.colorAcento.trim(),
      recomendadoPara: dto.recomendadoPara.trim(),
      urlImagen: dto.urlImagen.trim(),
      textoAlternativoImagen: dto.textoAlternativoImagen.trim(),
      activo: dto.activo ?? true,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.bicicletas.push(bicicleta);

    return bicicleta;
  }

  async actualizar(id: string, dto: ActualizarBicicletaDto): Promise<Bicicleta | null> {
    const indice = this.bicicletas.findIndex((bicicleta) => bicicleta.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.bicicletas[indice];
    const actualizada: Bicicleta = {
      ...actual,
      nombre: dto.nombre?.trim() ?? actual.nombre,
      categoria: dto.categoria?.trim() ?? actual.categoria,
      descripcionCorta: dto.descripcionCorta?.trim() ?? actual.descripcionCorta,
      detalle: dto.detalle?.trim() ?? actual.detalle,
      precio: dto.precio?.trim() ?? actual.precio,
      autonomia: dto.autonomia?.trim() ?? actual.autonomia,
      disponibilidad: dto.disponibilidad ?? actual.disponibilidad,
      colorAcento: dto.colorAcento?.trim() ?? actual.colorAcento,
      recomendadoPara: dto.recomendadoPara?.trim() ?? actual.recomendadoPara,
      urlImagen: dto.urlImagen?.trim() ?? actual.urlImagen,
      textoAlternativoImagen: dto.textoAlternativoImagen?.trim() ?? actual.textoAlternativoImagen,
      activo: dto.activo ?? actual.activo,
      updatedAt: now(),
    };

    this.bicicletas[indice] = actualizada;

    return actualizada;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.bicicletas.findIndex((bicicleta) => bicicleta.id === id);

    if (indice === -1) {
      return false;
    }

    this.bicicletas.splice(indice, 1);
    return true;
  }
}

class InMemoryReservasRepository implements RepositorioReservas {
  private readonly reservas: Reserva[];

  constructor(initialData: Reserva[]) {
    this.reservas = clone(initialData);
  }

  async listar(query: ListarReservasQueryDto): Promise<Reserva[]> {
    const correo = query.correoCliente?.trim().toLowerCase();

    const filtradas = this.reservas.filter((reserva) => {
      if (correo && reserva.correoCliente.toLowerCase() !== correo) return false;
      if (query.bicicletaId && reserva.bicicletaId !== query.bicicletaId) return false;
      if (query.estado && reserva.estado !== query.estado) return false;
      if (query.origen && reserva.origen !== query.origen) return false;

      return true;
    });

    const ordenadas = [...filtradas].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return paginate(ordenadas, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<Reserva | null> {
    return this.reservas.find((reserva) => reserva.id === id) ?? null;
  }

  async crear(reserva: Reserva): Promise<Reserva> {
    this.reservas.push(clone(reserva));
    return reserva;
  }

  async actualizar(id: string, cambios: Partial<Reserva>): Promise<Reserva | null> {
    const indice = this.reservas.findIndex((reserva) => reserva.id === id);

    if (indice === -1) {
      return null;
    }

    const actualizada: Reserva = {
      ...this.reservas[indice],
      ...cambios,
    };

    this.reservas[indice] = actualizada;
    return actualizada;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.reservas.findIndex((reserva) => reserva.id === id);

    if (indice === -1) {
      return false;
    }

    this.reservas.splice(indice, 1);
    return true;
  }
}

class InMemoryContactosRepository implements RepositorioContactos {
  private readonly mensajes: MensajeContacto[];

  constructor(initialData: MensajeContacto[]) {
    this.mensajes = clone(initialData);
  }

  async listar(query: ListarContactosQueryDto): Promise<MensajeContacto[]> {
    const email = query.email?.trim().toLowerCase();
    const asunto = query.asunto?.trim().toLowerCase();

    const filtrados = this.mensajes.filter((mensaje) => {
      if (email && mensaje.email.toLowerCase() !== email) return false;
      if (query.estado && mensaje.estado !== query.estado) return false;
      if (asunto && !mensaje.asunto.toLowerCase().includes(asunto)) return false;

      return true;
    });

    return paginate(filtrados, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<MensajeContacto | null> {
    return this.mensajes.find((mensaje) => mensaje.id === id) ?? null;
  }

  async crear(dto: CrearContactoDto, ticket: string): Promise<MensajeContacto> {
    const marcaTiempo = now();
    const mensaje: MensajeContacto = {
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      email: dto.email.trim().toLowerCase(),
      asunto: dto.asunto.trim(),
      mensaje: dto.mensaje.trim(),
      ticket,
      estado: EstadoMensajeContacto.NUEVO,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.mensajes.push(mensaje);
    return mensaje;
  }

  async actualizar(id: string, dto: ActualizarContactoDto): Promise<MensajeContacto | null> {
    const indice = this.mensajes.findIndex((mensaje) => mensaje.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.mensajes[indice];
    const actualizado: MensajeContacto = {
      ...actual,
      nombre: dto.nombre?.trim() ?? actual.nombre,
      email: dto.email?.trim().toLowerCase() ?? actual.email,
      asunto: dto.asunto?.trim() ?? actual.asunto,
      mensaje: dto.mensaje?.trim() ?? actual.mensaje,
      estado: dto.estado ?? actual.estado,
      updatedAt: now(),
    };

    this.mensajes[indice] = actualizado;
    return actualizado;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.mensajes.findIndex((mensaje) => mensaje.id === id);

    if (indice === -1) {
      return false;
    }

    this.mensajes.splice(indice, 1);
    return true;
  }
}

class InMemoryUbicacionesRepository implements RepositorioUbicaciones {
  private readonly ubicaciones: ConfiguracionUbicacion[];

  constructor(initialData: ConfiguracionUbicacion[]) {
    this.ubicaciones = clone(initialData);
  }

  async listar(query: ListarUbicacionesQueryDto): Promise<ConfiguracionUbicacion[]> {
    const titulo = query.titulo?.trim().toLowerCase();
    const direccion = query.direccion?.trim().toLowerCase();

    const filtradas = this.ubicaciones.filter((ubicacion) => {
      if (titulo && !ubicacion.titulo.toLowerCase().includes(titulo)) return false;
      if (direccion && !ubicacion.direccion.toLowerCase().includes(direccion)) return false;

      return true;
    });

    return paginate(filtradas, query.offset, query.limit);
  }

  async obtenerPorId(id: string): Promise<ConfiguracionUbicacion | null> {
    return this.ubicaciones.find((ubicacion) => ubicacion.id === id) ?? null;
  }

  async obtenerConfiguracionMapa(): Promise<ConfiguracionUbicacion | null> {
    return [...this.ubicaciones].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null;
  }

  async crear(dto: CrearUbicacionDto): Promise<ConfiguracionUbicacion> {
    const marcaTiempo = now();
    const ubicacion: ConfiguracionUbicacion = {
      id: randomUUID(),
      titulo: dto.titulo.trim(),
      subtitulo: dto.subtitulo.trim(),
      direccion: dto.direccion.trim(),
      horario: dto.horario.trim(),
      telefonoContacto: dto.telefonoContacto.trim(),
      emailContacto: dto.emailContacto.trim().toLowerCase(),
      etiquetaCta: dto.etiquetaCta.trim(),
      urlExterna: dto.urlExterna.trim(),
      urlImagen: dto.urlImagen?.trim() || null,
      urlEmbed: dto.urlEmbed?.trim() || null,
      createdAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    this.ubicaciones.push(ubicacion);
    return ubicacion;
  }

  async actualizar(id: string, dto: ActualizarUbicacionDto): Promise<ConfiguracionUbicacion | null> {
    const indice = this.ubicaciones.findIndex((ubicacion) => ubicacion.id === id);

    if (indice === -1) {
      return null;
    }

    const actual = this.ubicaciones[indice];
    const actualizada: ConfiguracionUbicacion = {
      ...actual,
      titulo: dto.titulo?.trim() ?? actual.titulo,
      subtitulo: dto.subtitulo?.trim() ?? actual.subtitulo,
      direccion: dto.direccion?.trim() ?? actual.direccion,
      horario: dto.horario?.trim() ?? actual.horario,
      telefonoContacto: dto.telefonoContacto?.trim() ?? actual.telefonoContacto,
      emailContacto: dto.emailContacto?.trim().toLowerCase() ?? actual.emailContacto,
      etiquetaCta: dto.etiquetaCta?.trim() ?? actual.etiquetaCta,
      urlExterna: dto.urlExterna?.trim() ?? actual.urlExterna,
      urlImagen: dto.urlImagen === undefined ? actual.urlImagen : dto.urlImagen?.trim() || null,
      urlEmbed: dto.urlEmbed === undefined ? actual.urlEmbed : dto.urlEmbed?.trim() || null,
      updatedAt: now(),
    };

    this.ubicaciones[indice] = actualizada;
    return actualizada;
  }

  async eliminar(id: string): Promise<boolean> {
    const indice = this.ubicaciones.findIndex((ubicacion) => ubicacion.id === id);

    if (indice === -1) {
      return false;
    }

    this.ubicaciones.splice(indice, 1);
    return true;
  }
}

export interface TestRepositoryBundle {
  usuariosRepo: RepositorioUsuarios;
  bicicletasRepo: RepositorioBicicletas;
  reservasRepo: RepositorioReservas;
  contactosRepo: RepositorioContactos;
  ubicacionesRepo: RepositorioUbicaciones;
}

export async function createTestRepositoryBundle(): Promise<TestRepositoryBundle> {
  const [clienteHash, adminHash] = await Promise.all([
    generarHashSeguro('Cliente123!'),
    generarHashSeguro('Admin123!'),
  ]);

  const usuarios: Usuario[] = [
    {
      id: '0f2e9953-3d20-478f-a1c4-8ea5db5d1001',
      email: 'cliente@easybike.com',
      nombreCompleto: 'Valeria Torres',
      rol: RolUsuario.CLIENTE,
      telefono: '8913-4973',
      passwordHash: clienteHash,
      refreshTokenHash: null,
      activo: true,
      ultimoAccesoAt: null,
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:20:00.000Z',
    },
    {
      id: '9e3d4af9-2d37-4af3-a703-443bcd741002',
      email: 'admin@easybike.com',
      nombreCompleto: 'Carlos Mendoza',
      rol: RolUsuario.ADMINISTRACION,
      telefono: '8913-0000',
      passwordHash: adminHash,
      refreshTokenHash: null,
      activo: true,
      ultimoAccesoAt: null,
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:20:00.000Z',
    },
  ];

  const bicicletas: Bicicleta[] = [
    {
      id: '6d2feecb-1558-4a18-832a-0d5517e83001',
      nombre: 'Bicicleta eléctrica urbana',
      categoria: 'Urbana',
      descripcionCorta: 'Ligera, estable y lista para recorridos diarios.',
      detalle: 'Modelo urbano con autonomía útil para traslados dentro de la ciudad.',
      precio: 'Desde $22 / 24 h',
      autonomia: 'Hasta 45 km',
      disponibilidad: DisponibilidadBicicleta.DISPONIBLE,
      colorAcento: '#f28705',
      recomendadoPara: 'Movilidad urbana y trayectos rápidos.',
      urlImagen: '/images/carruselBici1.jpg',
      textoAlternativoImagen: 'Bicicleta eléctrica urbana Easy Bike',
      activo: true,
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:20:00.000Z',
    },
    {
      id: '7d2feecb-1558-4a18-832a-0d5517e83002',
      nombre: 'City Flow plegable',
      categoria: 'Plegable',
      descripcionCorta: 'Compacta para trayectos mixtos.',
      detalle: 'Bicicleta plegable para usuarios que combinan varios medios de transporte.',
      precio: 'Desde $25 / 24 h',
      autonomia: 'Hasta 35 km',
      disponibilidad: DisponibilidadBicicleta.ULTIMAS_UNIDADES,
      colorAcento: '#1b7f8f',
      recomendadoPara: 'Espacios reducidos y trayectos combinados.',
      urlImagen: '/images/carruselBici2-BicicletaElectricaPlegable.jpg',
      textoAlternativoImagen: 'Bicicleta plegable Easy Bike',
      activo: true,
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:20:00.000Z',
    },
    {
      id: '8d2feecb-1558-4a18-832a-0d5517e83003',
      nombre: 'Swift Comfort',
      categoria: 'Confort',
      descripcionCorta: 'Conducción estable y relajada.',
      detalle: 'Pensada para usuarios que priorizan comodidad y postura alta.',
      precio: 'Desde $27 / 24 h',
      autonomia: 'Hasta 40 km',
      disponibilidad: DisponibilidadBicicleta.PROXIMAMENTE,
      colorAcento: '#53b9cc',
      recomendadoPara: 'Trayectos tranquilos dentro de la ciudad.',
      urlImagen: '/images/carruselBici1.jpg',
      textoAlternativoImagen: 'Bicicleta confort Easy Bike',
      activo: true,
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:20:00.000Z',
    },
  ];

  const ubicaciones: ConfiguracionUbicacion[] = [
    {
      id: '3d2feecb-1558-4a18-832a-0d5517e83009',
      titulo: 'Encuéntranos fácilmente',
      subtitulo: 'Ubicación operativa para reservas, soporte y retiro de bicicletas.',
      direccion: 'Iglesia El Calvario, 2 cuadras al sur, Barrio El Calvario, León.',
      horario: 'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
      telefonoContacto: '8913-4973',
      emailContacto: 'hola@easybike.com',
      etiquetaCta: 'Abrir en Google Maps',
      urlExterna:
        'https://www.google.com/maps/search/?api=1&query=12%C2%B026%2706.8%22N%2086%C2%B052%2723.2%22W',
      urlImagen: '',
      urlEmbed: '',
      createdAt: '2026-07-01T09:20:00.000Z',
      updatedAt: '2026-07-01T09:20:00.000Z',
    },
  ];

  const reservas: Reserva[] = [];
  const contactos: MensajeContacto[] = [];

  return {
    usuariosRepo: new InMemoryUsuariosRepository(usuarios),
    bicicletasRepo: new InMemoryBicicletasRepository(bicicletas),
    reservasRepo: new InMemoryReservasRepository(reservas),
    contactosRepo: new InMemoryContactosRepository(contactos),
    ubicacionesRepo: new InMemoryUbicacionesRepository(ubicaciones),
  };
}

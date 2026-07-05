import { ConflictException } from '@nestjs/common';
import { DisponibilidadBicicleta } from '../comun/enums/disponibilidad-bicicleta.enum';
import { RepositorioBicicletas } from '../bicicletas/repositorios/bicicletas.repositorio';
import { RepositorioReservas } from './repositorios/reservas.repositorio';
import { ReservasService } from './reservas.service';

describe('ReservasService', () => {
  const bicicletaDisponible = {
    id: 'bike-1',
    nombre: 'Bici Disponible',
    categoria: 'Urbana',
    descripcionCorta: 'Lista para reservar',
    detalle: 'Detalle',
    precio: 'Desde $22 / 24 h',
    autonomia: 'Hasta 40 km',
    disponibilidad: DisponibilidadBicicleta.DISPONIBLE,
    colorAcento: '#123456',
    recomendadoPara: 'Ciudad',
    urlImagen: '/img.jpg',
    textoAlternativoImagen: 'img',
    activo: true,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  };

  const bicicletaNoDisponible = {
    ...bicicletaDisponible,
    id: 'bike-2',
    disponibilidad: DisponibilidadBicicleta.PROXIMAMENTE,
  };

  function crearServicio() {
    const repositorioReservas = {
      listar: jest.fn(),
      obtenerPorId: jest.fn(),
      crear: jest.fn(async (reserva) => reserva),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    } as unknown as RepositorioReservas;

    const repositorioBicicletas = {
      listar: jest.fn(),
      obtenerPorId: jest.fn(async (id: string) =>
        id === bicicletaNoDisponible.id ? bicicletaNoDisponible : bicicletaDisponible,
      ),
      crear: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    } as unknown as RepositorioBicicletas;

    return {
      service: new ReservasService(repositorioReservas, repositorioBicicletas),
      repositorioReservas,
    };
  }

  it('genera voucher y pago físico en una reserva válida', async () => {
    const { service } = crearServicio();

    const resultado = await service.crear({
      fullName: 'Valeria Torres',
      email: 'cliente@easybike.com',
      phone: '+505 8888-9999',
      bikeId: bicicletaDisponible.id,
      date: '2026-07-10',
      time: '10:00',
      duration: 24,
      pickupPoint: 'Punto Central Easy Bike',
      notes: '',
    });

    expect(resultado.success).toBe(true);
    expect(resultado.amount).toBe(22);
    expect(resultado.voucher.paymentMethod).toBe('Pago físico al retirar la bicicleta');
  });

  it('rechaza bicicletas no reservables', async () => {
    const { service } = crearServicio();

    await expect(
      service.crear({
        fullName: 'Cliente',
        email: 'cliente@easybike.com',
        phone: '+505 8888-9999',
        bikeId: bicicletaNoDisponible.id,
        date: '2026-07-10',
        time: '10:00',
        duration: 24,
        pickupPoint: 'Punto Central Easy Bike',
        notes: '',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('permite crear reservas sin teléfono', async () => {
    const { service } = crearServicio();

    const resultado = await service.crear({
      fullName: 'Cliente Sin Teléfono',
      email: 'cliente@easybike.com',
      bikeId: bicicletaDisponible.id,
      date: '2026-07-10',
      time: '10:00',
      duration: 24,
      pickupPoint: 'Punto Central Easy Bike',
      notes: '',
    });

    expect(resultado.success).toBe(true);
    expect(resultado.reservation.telefonoCliente).toBeNull();
  });
});

import type {
  AboutValue,
  BenefitItem,
  BikeItem,
  ContactCard,
  FooterColumn,
  FooterMeta,
  LocationConfig,
  LoginHighlight,
  MilestoneItem,
  MockUser,
  NavigationItem,
  ReservationSummary,
  StatItem,
} from '../types'

export const navigationItems: NavigationItem[] = [
  { id: 'bicicletas', label: 'Bicicletas disponibles' },
  { id: 'sobre-nosotros', label: 'Sobre nosotros' },
  { id: 'contactanos', label: 'Contáctanos' },
  { id: 'login', label: 'Iniciar sesión', variant: 'cta' },
]

export const homeStats: StatItem[] = [
  { value: '+120', label: 'bicicletas listas para reservar' },
  { value: '24 h', label: 'de uso por reserva seleccionada' },
  { value: '5 min', label: 'para completar tu reserva' },
]

export const homeBenefits: BenefitItem[] = [
  {
    eyebrow: 'Reserva fácil y rápida',
    title: 'Una experiencia directa desde el primer clic',
    description:
      'Diseñamos una interfaz clara para que tu usuario encuentre, compare y reserve una bicicleta sin fricción.',
  },
  {
    eyebrow: 'Movilidad urbana',
    title: 'Opciones pensadas para la ciudad y trayectos cotidianos',
    description:
      'Cada modelo disponible se presenta con información útil para decidir por autonomía, estilo y comodidad.',
  },
  {
    eyebrow: 'Uso por 24 horas',
    title: 'Reserva flexible con información visible',
    description:
      'La web deja claro el tiempo de uso, el punto de recojo y el estado actual de cada bicicleta.',
  },
]

export const bikeCatalog: BikeItem[] = [
  {
    id: 'urbana-volt',
    name: 'Bicicleta eléctrica urbana',
    category: 'Urbana',
    shortDescription: 'Ligera, estable y perfecta para moverte entre clases, trabajo y recados.',
    detail:
      'Perfecta para desplazamientos en la ciudad, cómoda, práctica y fácil de manejar. Ideal si quieres un recorrido ágil con postura relajada.',
    price: 'Desde $22 / 24 h',
    autonomy: 'Hasta 45 km',
    availability: 'Disponible',
    accent: '#f28705',
    recommendedFor: 'Recorridos diarios y traslados rápidos.',
    imageUrl: '/images/carruselBici1.jpg',
    imageAlt: 'Bicicleta eléctrica urbana Easy Bike',
  },
  {
    id: 'city-flow',
    name: 'City Flow plegable',
    category: 'Plegable',
    shortDescription: 'Compacta para departamentos, oficinas y usuarios que combinan trayectos.',
    detail:
      'Su diseño plegable la hace ideal para usuarios que necesitan ahorrar espacio y combinar movilidad con transporte público.',
    price: 'Desde $25 / 24 h',
    autonomy: 'Hasta 35 km',
    availability: 'Últimas unidades',
    accent: '#1b7f8f',
    recommendedFor: 'Espacios reducidos y trayectos mixtos.',
    imageUrl: '/images/carruselBici2-BicicletaElectricaPlegable.jpg',
    imageAlt: 'Bicicleta plegable City Flow Easy Bike',
  },
  {
    id: 'terra-x',
    name: 'Terra X adventure',
    category: 'Todoterreno',
    shortDescription: 'Construida para superficies irregulares y rutas más largas de fin de semana.',
    detail:
      'Ofrece mayor soporte, llantas robustas y un perfil más aventurero para quienes quieren una bici eléctrica versátil.',
    price: 'Desde $31 / 24 h',
    autonomy: 'Hasta 55 km',
    availability: 'Disponible',
    accent: '#18362f',
    recommendedFor: 'Aventura ligera y rutas urbanas exigentes.',
    imageUrl: '/images/carruselBici2.jpg',
    imageAlt: 'Bicicleta todoterreno Terra X Easy Bike',
  },
  {
    id: 'swift-comfort',
    name: 'Swift Comfort',
    category: 'Confort',
    shortDescription: 'Una opción cómoda, estable y con postura alta para trayectos relajados.',
    detail:
      'Pensada para quienes priorizan confort, seguridad y una experiencia muy amigable al conducir por la ciudad.',
    price: 'Desde $27 / 24 h',
    autonomy: 'Hasta 40 km',
    availability: 'Próximamente',
    accent: '#53b9cc',
    recommendedFor: 'Usuarios primerizos y trayectos tranquilos.',
    imageUrl: '/images/carruselBici1.jpg',
    imageAlt: 'Bicicleta confort Swift Comfort Easy Bike',
  },
]

export const locationConfig: LocationConfig = {
  title: 'Encuéntranos fácilmente',
  subtitle:
    'Este bloque ya queda listo para insertar Google Maps desde frontend cuando backend entregue la URL o configuración final.',
  address: 'Av. Principal 245, zona céntrica, referencia frente al parque principal.',
  schedule: 'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
  ctaLabel: 'Abrir en Google Maps',
  externalUrl: 'https://www.google.com/maps',
  imageUrl: '',
  embedUrl: '',
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Navegación',
    links: [
      { label: 'Inicio', page: 'inicio' },
      { label: 'Bicicletas disponibles', page: 'bicicletas' },
      { label: 'Sobre nosotros', page: 'sobre-nosotros' },
    ],
  },
  {
    title: 'Atención',
    links: [
      { label: 'Contáctanos', page: 'contactanos' },
      { label: 'Iniciar sesión', page: 'login' },
      { label: 'Mapa del sitio', href: '#/inicio' },
    ],
  },
  {
    title: 'Reservas',
    links: [
      { label: 'Modelos urbanos', page: 'bicicletas' },
      { label: 'Condiciones de uso', href: '#/bicicletas' },
      { label: 'Preguntas frecuentes', href: '#/contactanos' },
    ],
  },
  {
    title: 'Conecta',
    links: [
      { label: 'Google Maps', href: 'https://www.google.com/maps' },
      { label: 'WhatsApp', href: 'https://wa.me/' },
      { label: 'Correo institucional', href: 'mailto:hola@easybike.com' },
    ],
  },
]

export const footerMeta: FooterMeta = {
  brand: 'Easy Bike',
  description:
    'Plataforma web para reservar bicicletas eléctricas con una experiencia clara, sobria y lista para integrarse con backend.',
  caption: 'Easy Bike · Proyecto frontend preparado para integración con backend y Google Maps.',
}

export const aboutValues: AboutValue[] = [
  {
    title: 'Movilidad sostenible',
    description:
      'Promovemos desplazamientos más cómodos y responsables con una propuesta digital simple y accesible.',
  },
  {
    title: 'Experiencia confiable',
    description:
      'La web prioriza claridad visual, estados de disponibilidad e informar al cliente sobre los distintos productos que se ofrecen.',
  },
  {
    title: 'Diseño con propósito',
    description:
      'Cada sección está pensada para ayudar al usuario a decidir rápido, reservar mejor y entender el servicio.',
  },
]

export const aboutMilestones: MilestoneItem[] = [
  {
    year: '01',
    title: 'Descubre',
    description: 'El usuario explora bicicletas disponibles, beneficios y puntos de contacto en una sola experiencia.',
  },
  {
    year: '02',
    title: 'Reserva',
    description: 'El formulario recoge datos completos de la reserva y queda listo para integrarse con la API.',
  },
  {
    year: '03',
    title: 'Conecta',
    description: 'La arquitectura visual ya prevé integración con mapas, autenticación y servicios del backend.',
  },
]

export const contactCards: ContactCard[] = [
  {
    title: 'Correo',
    value: 'de575836@gmail.com',
    note: 'Ideal para consultas generales, soporte y confirmaciones.',
  },
  {
    title: 'Teléfono',
    value: '+505 8913-4973',
    note: 'Atención directa para reservas y dudas urgentes.',
  },
  {
    title: 'Horario',
    value: 'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
    note: 'Te respondemos dentro del horario operativo de la tienda.',
  },
]

export const loginHighlights: LoginHighlight[] = [
  {
    title: 'Clientes',
    description: 'Consulta tus reservas, genera tu voucher y confirma el punto de recojo en un solo lugar.',
  },
  {
    title: 'Administración',
    description: 'Gestiona bicicletas, disponibilidad y el resumen contable desde un mismo panel de prueba.',
  },
]

export const mockUsers: MockUser[] = [
  {
    email: 'cliente@easybike.com',
    password: 'Eb123',
    role: 'cliente',
    name: 'Valeria Torres',
  },
  {
    email: 'admin@easybike.com',
    password: 'Eb123',
    role: 'administracion',
    name: 'Carlos Mendoza',
  },
]

export const initialReservations: ReservationSummary[] = [
  {
    id: 'res-001',
    customerName: 'Valeria Torres',
    customerEmail: 'cliente@easybike.com',
    bikeId: 'urbana-volt',
    bikeName: 'Bicicleta eléctrica urbana',
    date: '2026-07-04',
    time: '09:00',
    duration: '24 horas',
    pickupPoint: 'Punto central Easy Bike',
    amount: 22,
    status: 'Pendiente de entrega',
    voucherCode: 'RSV-URBANA-2401',
    paymentMethod: 'Pago físico al retirar la bicicleta',
    createdAt: '2026-07-01T09:20:00.000Z',
  },
  {
    id: 'res-002',
    customerName: 'Valeria Torres',
    customerEmail: 'cliente@easybike.com',
    bikeId: 'terra-x',
    bikeName: 'Terra X adventure',
    date: '2026-06-24',
    time: '10:30',
    duration: '8 horas',
    pickupPoint: 'Sede universitaria',
    amount: 31,
    status: 'Completada',
    voucherCode: 'RSV-TERRA-1836',
    paymentMethod: 'Pago físico al retirar la bicicleta',
    createdAt: '2026-06-22T14:05:00.000Z',
  },
  {
    id: 'res-003',
    customerName: 'Andrea Ruiz',
    customerEmail: 'andrea@easybike.com',
    bikeId: 'city-flow',
    bikeName: 'City Flow plegable',
    date: '2026-07-02',
    time: '15:00',
    duration: '4 horas',
    pickupPoint: 'Parque principal',
    amount: 25,
    status: 'Activa',
    voucherCode: 'RSV-CITY-7824',
    paymentMethod: 'Pago físico al retirar la bicicleta',
    createdAt: '2026-06-30T16:10:00.000Z',
  },
]

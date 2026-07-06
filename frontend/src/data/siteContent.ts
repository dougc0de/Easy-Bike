import type {
  AboutValue,
  BenefitItem,
  FooterColumn,
  FooterMeta,
  LoginHighlight,
  LocationConfig,
  MilestoneItem,
  NavigationItem,
  StatItem,
} from '../types'

export const navigationItems: NavigationItem[] = [
  { id: 'bicicletas', label: 'Bicicletas disponibles' },
  { id: 'sobre-nosotros', label: 'Sobre nosotros' },
  { id: 'contactanos', label: 'Contáctanos' },
  { id: 'login', label: 'Iniciar sesión', variant: 'cta' },
]

export const homeStats: StatItem[] = [
  { value: '24 h', label: 'de uso por reserva seleccionada' },
  { value: '1 punto', label: 'de recojo definido para confirmar tu entrega' },
  { value: 'Soporte', label: 'para resolver dudas y dar seguimiento a tu reserva' },
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

export const locationConfig: LocationConfig = {
  title: 'Encuéntranos fácilmente',
  subtitle: 'Ubicación oficial de Easy Bike para atención, reservas y retiro de bicicletas en León.',
  address: 'Iglesia El Calvario, 2 cuadras al sur, en el Barrio El Calvario, León.',
  schedule: 'Lunes a sábado · 8:00 a.m. - 8:00 p.m.',
  contactPhone: '+505 8913-4973',
  contactEmail: 'de575836@gmail.com',
  ctaLabel: 'Abrir en Google Maps',
  externalUrl: 'https://www.google.com/maps/search/?api=1&query=12%C2%B026%2706.8%22N%2086%C2%B052%2723.2%22W',
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
      { label: 'Crear cuenta', page: 'registrarse' },
    ],
  },
  {
    title: 'Reservas',
    links: [
      { label: 'Bicicletas disponibles', page: 'bicicletas' },
      { label: 'Reservar desde mi perfil', page: 'login' },
      { label: 'Sobre nosotros', page: 'sobre-nosotros' },
    ],
  },
]

export const footerMeta: FooterMeta = {
  brand: 'Easy Bike',
  description:
    'Plataforma web para reservar bicicletas eléctricas con una experiencia clara y conectada al backend operativo.',
  caption: 'Derechos Reservados.',
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
    description: 'El formulario recoge datos completos de la reserva y los envía a la API del sistema.',
  },
  {
    year: '03',
    title: 'Conecta',
    description: 'La experiencia conecta mapas, autenticación y servicios del backend dentro del mismo flujo.',
  },
]

export const loginHighlights: LoginHighlight[] = [
  {
    title: 'Clientes',
    description: 'Consulta tus reservas, genera tu voucher y confirma el punto de recojo en un solo lugar.',
  },
  {
    title: 'Administración',
    description: 'Gestiona bicicletas, disponibilidad y el resumen contable desde un mismo panel administrativo.',
  },
]

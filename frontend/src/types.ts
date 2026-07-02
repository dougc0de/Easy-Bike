export type PageId =
  | 'inicio'
  | 'bicicletas'
  | 'sobre-nosotros'
  | 'contactanos'
  | 'login'
  | 'registrarse'
  | 'perfil-cliente'
  | 'panel-admin'

export type AuthRole = 'cliente' | 'administracion'

export interface NavigationItem {
  id: PageId
  label: string
  variant?: 'default' | 'cta'
}

export interface BenefitItem {
  eyebrow: string
  title: string
  description: string
}

export interface StatItem {
  value: string
  label: string
}

export interface BikeItem {
  id: string
  name: string
  category: string
  shortDescription: string
  detail: string
  price: string
  autonomy: string
  availability: 'Disponible' | 'Últimas unidades' | 'Próximamente'
  accent: string
  recommendedFor: string
  imageUrl: string
  imageAlt: string
}

export interface AuthSession {
  email: string
  role: AuthRole
  loggedAt: string
  name: string
}

export interface MockUser {
  email: string
  password: string
  role: AuthRole
  name: string
  createdAt?: string
}

export interface FooterLink {
  label: string
  href?: string
  page?: PageId
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export interface FooterMeta {
  brand: string
  description: string
  caption: string
}

export interface LocationConfig {
  title: string
  subtitle: string
  address: string
  schedule: string
  ctaLabel: string
  externalUrl: string
  imageUrl: string
  embedUrl: string
}

export interface AboutValue {
  title: string
  description: string
}

export interface MilestoneItem {
  year: string
  title: string
  description: string
}

export interface ContactCard {
  title: string
  value: string
  note: string
}

export interface LoginHighlight {
  title: string
  description: string
}

export interface ReservationVoucher {
  code: string
  bikeName: string
  date: string
  time: string
  duration: string
  pickupPoint: string
  paymentMethod: string
  note: string
}

export interface ReservationSummary {
  id: string
  customerName: string
  customerEmail: string
  bikeId: string
  bikeName: string
  date: string
  time: string
  duration: string
  pickupPoint: string
  amount: number
  status: 'Pendiente de entrega' | 'Activa' | 'Completada'
  voucherCode: string
  paymentMethod: string
  createdAt: string
}

export interface ReservationPayload {
  fullName: string
  email: string
  phone: string
  bikeId: string
  date: string
  time: string
  duration: string
  pickupPoint: string
  notes: string
}

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  confirmPassword: string
}

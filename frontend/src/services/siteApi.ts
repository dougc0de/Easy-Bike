import type {
  AuthSession,
  BikeItem,
  ContactPayload,
  LoginPayload,
  LocationConfig,
  RegisterPayload,
  ReservationPayload,
  ReservationSummary,
} from '../types'

const ACCESS_TOKEN_STORAGE_KEY = 'easybike-access-token'
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000'
const BACKEND_UNAVAILABLE_MESSAGE =
  'No se pudo conectar con el backend de Easy Bike. Verifica que Render esté activo e inténtalo nuevamente.'
const API_PAGE_LIMIT = 100

interface AuthApiResponse {
  success: boolean
  accessToken: string
  session: AuthSession
  message: string
}

interface SessionApiResponse {
  success: boolean
  session: AuthSession
}

interface BikeApiResponse {
  id: string
  name: string
  category: string
  shortDescription: string
  detail: string
  price: string
  autonomy: string
  availability: BikeItem['availability']
  accent: string
  recommendedFor: string
  imageUrl: string
  imageAlt: string
}

interface ReservationApiResponse {
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
  status: ReservationSummary['status']
  voucherCode: string
  paymentMethod: string
  createdAt: string
}

interface ReservationMutationResponse {
  success: boolean
  code: string
  amount: number
  voucher: {
    code: string
    bikeName: string
    date: string
    time: string
    duration: string
    pickupPoint: string
    paymentMethod: string
    note: string
  }
  message: string
  reservation: ReservationApiResponse
}

interface ContactApiResponse {
  success: boolean
  ticket: string
  message: string
}

interface LocationConfigApiResponse {
  title: string
  subtitle: string
  address: string
  schedule: string
  contactPhone: string
  contactEmail: string
  ctaLabel: string
  externalUrl: string
  imageUrl: string
  embedUrl: string
}

interface SubmitReservationOptions {
  mode?: 'cliente' | 'admin-store'
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getApiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function getStoredAccessToken() {
  if (typeof window === 'undefined') return ''

  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim() ?? ''
}

function persistAccessToken(token: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

function mapApiBike(bike: BikeApiResponse): BikeItem {
  return {
    id: bike.id,
    name: bike.name,
    category: bike.category,
    shortDescription: bike.shortDescription,
    detail: bike.detail,
    price: bike.price,
    autonomy: bike.autonomy,
    availability: bike.availability,
    accent: bike.accent,
    recommendedFor: bike.recommendedFor,
    imageUrl: bike.imageUrl,
    imageAlt: bike.imageAlt,
  }
}

function mapApiReservation(reservation: ReservationApiResponse): ReservationSummary {
  return {
    id: reservation.id,
    customerName: reservation.customerName,
    customerEmail: reservation.customerEmail,
    bikeId: reservation.bikeId,
    bikeName: reservation.bikeName,
    date: reservation.date,
    time: reservation.time,
    duration: reservation.duration,
    pickupPoint: reservation.pickupPoint,
    amount: reservation.amount,
    status: reservation.status,
    voucherCode: reservation.voucherCode,
    paymentMethod: reservation.paymentMethod,
    createdAt: reservation.createdAt,
  }
}

function mapApiLocationConfig(config: LocationConfigApiResponse): LocationConfig {
  return {
    title: config.title,
    subtitle: config.subtitle,
    address: config.address,
    schedule: config.schedule,
    contactPhone: config.contactPhone,
    contactEmail: config.contactEmail,
    ctaLabel: config.ctaLabel,
    externalUrl: config.externalUrl,
    imageUrl: config.imageUrl,
    embedUrl: config.embedUrl,
  }
}

function buildLoginNote(session: AuthSession) {
  return session.role === 'administracion'
    ? 'Entrarás al panel administrativo de Easy Bike con autenticación real.'
    : 'Entrarás a tu perfil de cliente para gestionar reservas con autenticación real.'
}

function buildPaginatedPath(path: string, offset: number) {
  const separator = path.includes('?') ? '&' : '?'

  return `${path}${separator}limit=${API_PAGE_LIMIT}&offset=${offset}`
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text()
  let parsed: { message?: string | string[] } | null = null

  if (rawText) {
    try {
      parsed = JSON.parse(rawText) as { message?: string | string[] }
    } catch {
      parsed = null
    }
  }

  if (!response.ok) {
    const message = Array.isArray(parsed?.message)
      ? parsed.message.join(' ')
      : parsed?.message || 'No se pudo completar la solicitud al backend.'

    throw new Error(message)
  }

  return parsed as T
}

async function apiRequest<T>(path: string, init: RequestInit = {}, useAccessToken = false) {
  const headers = new Headers(init.headers)

  headers.set('Accept', 'application/json')

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (useAccessToken) {
    const accessToken = getStoredAccessToken()

    if (!accessToken) {
      throw new Error('No existe un access token guardado para continuar.')
    }

    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  let response: Response

  try {
    response = await fetch(getApiUrl(path), {
      ...init,
      headers,
      credentials: 'include',
    })
  } catch (error) {
    if (error instanceof Error && /fetch|network/i.test(error.message)) {
      throw new Error(BACKEND_UNAVAILABLE_MESSAGE)
    }

    throw error
  }

  return parseApiResponse<T>(response)
}

async function fetchPaginatedCollection<TResponse, TMapped>(
  path: string,
  mapItem: (item: TResponse) => TMapped,
  useAccessToken = false,
) {
  const collection: TMapped[] = []

  for (let offset = 0; ; offset += API_PAGE_LIMIT) {
    const page = await apiRequest<TResponse[]>(
      buildPaginatedPath(path, offset),
      { method: 'GET' },
      useAccessToken,
    )

    collection.push(...page.map((item) => mapItem(item)))

    if (page.length < API_PAGE_LIMIT) {
      break
    }
  }

  return collection
}

export function clearStoredAccessToken() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function hasStoredAccessToken() {
  return Boolean(getStoredAccessToken())
}

export async function fetchBikeCatalog() {
  return fetchPaginatedCollection('/bicicletas', mapApiBike)
}

export async function fetchPublicLocationConfig() {
  const result = await apiRequest<LocationConfigApiResponse>('/ubicaciones/configuracion-mapa', {
    method: 'GET',
  })

  return mapApiLocationConfig(result)
}

export async function fetchReservationsForSession(session: AuthSession) {
  const endpoint =
    session.role === 'administracion' ? '/admin/reservas' : '/reservas'

  return fetchPaginatedCollection(endpoint, mapApiReservation, true)
}

export async function submitReservation(payload: ReservationPayload, options: SubmitReservationOptions = {}) {
  const endpoint = options.mode === 'admin-store' ? '/admin/reservas-en-tienda' : '/reservas'
  const result = await apiRequest<ReservationMutationResponse>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify({
        fullName: payload.fullName.trim(),
        email: normalizeEmail(payload.email),
        phone: payload.phone.trim(),
        bikeId: payload.bikeId,
        date: payload.date,
        time: payload.time,
        duration: Number(payload.duration),
        pickupPoint: payload.pickupPoint.trim(),
        notes: payload.notes.trim(),
      }),
    },
    true,
  )

  return {
    ...result,
    reservation: mapApiReservation(result.reservation),
  }
}

export async function submitContactMessage(payload: ContactPayload) {
  return apiRequest<ContactApiResponse>('/contactos', {
    method: 'POST',
    body: JSON.stringify({
      nombre: payload.name.trim(),
      email: normalizeEmail(payload.email),
      asunto: payload.subject.trim(),
      mensaje: payload.message.trim(),
    }),
  })
}

export async function createBikeRecord(bike: Omit<BikeItem, 'id'>) {
  const result = await apiRequest<BikeApiResponse>(
    '/bicicletas',
    {
      method: 'POST',
      body: JSON.stringify({
        nombre: bike.name.trim(),
        categoria: bike.category.trim(),
        descripcionCorta: bike.shortDescription.trim(),
        detalle: bike.detail.trim(),
        precio: bike.price.trim(),
        autonomia: bike.autonomy.trim(),
        disponibilidad: bike.availability,
        colorAcento: bike.accent.trim(),
        recomendadoPara: bike.recommendedFor.trim(),
        urlImagen: bike.imageUrl.trim(),
        textoAlternativoImagen: bike.imageAlt.trim(),
        activo: true,
      }),
    },
    true,
  )

  return mapApiBike(result)
}

export async function updateBikeAvailabilityStatus(
  bikeId: string,
  availability: BikeItem['availability'],
) {
  const result = await apiRequest<BikeApiResponse>(
    `/admin/bicicletas/${bikeId}/disponibilidad`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        disponibilidad: availability,
      }),
    },
    true,
  )

  return mapApiBike(result)
}

export async function loginUser(payload: LoginPayload) {
  const result = await apiRequest<AuthApiResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({
        email: normalizeEmail(payload.email),
        password: payload.password.trim(),
      }),
    },
  )

  persistAccessToken(result.accessToken)

  return {
    success: result.success,
    session: result.session,
    welcome: `Bienvenido, ${result.session.name}.`,
    note: buildLoginNote(result.session),
  }
}

export async function registerUser(payload: RegisterPayload) {
  const result = await apiRequest<AuthApiResponse>(
    '/auth/registro',
    {
      method: 'POST',
      body: JSON.stringify({
        nombreCompleto: payload.name.trim(),
        email: normalizeEmail(payload.email),
        password: payload.password.trim(),
        confirmPassword: payload.confirmPassword.trim(),
      }),
    },
  )

  persistAccessToken(result.accessToken)

  return {
    success: result.success,
    session: result.session,
    message: result.message,
  }
}

export async function fetchCurrentSession() {
  return apiRequest<SessionApiResponse>('/auth/perfil', { method: 'GET' }, true)
}

export async function refreshUserSession() {
  const result = await apiRequest<AuthApiResponse>(
    '/auth/refresh',
    {
      method: 'POST',
    },
  )

  persistAccessToken(result.accessToken)

  return {
    success: result.success,
    session: result.session,
    message: result.message,
  }
}

export async function logoutUser() {
  try {
    const result = await apiRequest<{ success: boolean; message: string }>(
      '/auth/logout',
      {
        method: 'POST',
      },
    )

    return result
  } finally {
    clearStoredAccessToken()
  }
}

import { bikeCatalog } from '../data/siteContent'
import type {
  AuthSession,
  ContactPayload,
  LoginPayload,
  RegisterPayload,
  ReservationPayload,
} from '../types'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const ACCESS_TOKEN_STORAGE_KEY = 'easybike-access-token'
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000'
const RESERVATION_SUCCESS_MESSAGE =
  'Reserva simulada correctamente. Tu voucher ya queda listo para mostrarlo al retirar la bicicleta. Recuerda que el pago se hace físicamente al retirar la bicicleta.'

function formatDuration(duration: string) {
  return duration.includes('hora') ? duration : `${duration} horas`
}

function parseAmount(priceLabel?: string) {
  if (!priceLabel) return 0

  const matchedValue = priceLabel.match(/\$ ?(\d+(?:\.\d+)?)/)

  return matchedValue ? Number(matchedValue[1]) : 0
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

export function clearStoredAccessToken() {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function hasStoredAccessToken() {
  return Boolean(getStoredAccessToken())
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

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  })

  return parseApiResponse<T>(response)
}

function buildLoginNote(session: AuthSession) {
  return session.role === 'administracion'
    ? 'Entrarás al panel administrativo de Easy Bike con autenticación real.'
    : 'Entrarás a tu perfil de cliente para gestionar reservas con autenticación real.'
}

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

interface SubmitReservationOptions {
  bikeName?: string
  priceLabel?: string
}

export async function submitReservation(payload: ReservationPayload, options: SubmitReservationOptions = {}) {
  await wait(900)

  const bike = bikeCatalog.find((item) => item.id === payload.bikeId)
  const code = `RSV-${payload.bikeId.toUpperCase()}-${Date.now().toString().slice(-4)}`
  const bikeName = options.bikeName ?? bike?.name ?? 'Bicicleta Easy Bike'
  const duration = formatDuration(payload.duration)
  const amount = parseAmount(options.priceLabel ?? bike?.price)

  return {
    success: true,
    code,
    amount,
    voucher: {
      code,
      bikeName,
      date: payload.date,
      time: payload.time,
      duration,
      pickupPoint: payload.pickupPoint,
      paymentMethod: 'Pago físico al retirar la bicicleta',
      note: 'Presenta este voucher al retirar tu bicicleta. El pago se completa físicamente en el punto de recojo.',
    },
    message: RESERVATION_SUCCESS_MESSAGE,
  }
}

export async function submitContactMessage(payload: ContactPayload) {
  await wait(700)

  return {
    success: true,
    ticket: `MSG-${Date.now().toString().slice(-5)}`,
    message: `Gracias ${payload.name}, tu mensaje quedó registrado en el frontend.`,
  }
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

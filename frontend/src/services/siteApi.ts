import { bikeCatalog, mockUsers } from '../data/siteContent'
import type { AuthRole, AuthSession, ContactPayload, LoginPayload, MockUser, RegisterPayload, ReservationPayload } from '../types'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const MOCK_USERS_STORAGE_KEY = 'easybike-mock-users'
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

interface SubmitReservationOptions {
  bikeName?: string
  priceLabel?: string
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'cliente' || value === 'administracion'
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isValidMockUser(value: unknown): value is MockUser {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<MockUser>

  return Boolean(
    candidate.email &&
      candidate.password &&
      candidate.name &&
      isAuthRole(candidate.role),
  )
}

function getStoredMockUsers() {
  if (typeof window === 'undefined') return [] as MockUser[]

  const storedUsers = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY)

  if (!storedUsers) return []

  try {
    const parsedUsers = JSON.parse(storedUsers) as unknown[]

    if (!Array.isArray(parsedUsers)) {
      window.localStorage.removeItem(MOCK_USERS_STORAGE_KEY)
      return []
    }

    return parsedUsers
      .filter(isValidMockUser)
      .map((user) => ({
        ...user,
        email: normalizeEmail(user.email),
      }))
  } catch {
    window.localStorage.removeItem(MOCK_USERS_STORAGE_KEY)
    return []
  }
}

function persistStoredMockUsers(users: MockUser[]) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

function getAllMockUsers() {
  const mergedUsers = new Map<string, MockUser>()

  for (const user of mockUsers) {
    const normalizedEmail = normalizeEmail(user.email)

    mergedUsers.set(normalizedEmail, {
      ...user,
      email: normalizedEmail,
    })
  }

  for (const user of getStoredMockUsers()) {
    mergedUsers.set(normalizeEmail(user.email), {
      ...user,
      email: normalizeEmail(user.email),
    })
  }

  return Array.from(mergedUsers.values())
}

function buildSession(user: MockUser): AuthSession {
  return {
    email: normalizeEmail(user.email),
    role: user.role,
    loggedAt: new Date().toISOString(),
    name: user.name,
  }
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
  await wait(650)

  const email = normalizeEmail(payload.email)
  const password = payload.password.trim()
  const user = getAllMockUsers().find((entry) => entry.email === email && entry.password === password)

  if (!user) {
    throw new Error('Credenciales inválidas. Revisa tu correo y contraseña para continuar.')
  }

  const session = buildSession(user)

  return {
    success: true,
    session,
    welcome: `Bienvenido, ${user.name}.`,
    note:
      user.role === 'administracion'
        ? 'Entrarás al panel administrativo de prueba con gestión de bicicletas y contabilidad mock.'
        : 'Entrarás a tu perfil de cliente con reserva, historial y voucher de prueba.',
  }
}

export async function registerUser(payload: RegisterPayload) {
  await wait(700)

  const name = payload.name.trim()
  const email = normalizeEmail(payload.email)
  const password = payload.password.trim()
  const confirmPassword = payload.confirmPassword.trim()

  if (!name || !email || !password || !confirmPassword) {
    throw new Error('Completa todos los campos para crear tu cuenta.')
  }

  if (password !== confirmPassword) {
    throw new Error('La confirmación de contraseña no coincide.')
  }

  const existingUser = getAllMockUsers().find((entry) => entry.email === email)

  if (existingUser) {
    throw new Error('Ese correo ya está registrado. Inicia sesión o usa otro correo.')
  }

  const newUser: MockUser = {
    email,
    password,
    role: 'cliente',
    name,
    createdAt: new Date().toISOString(),
  }

  const storedUsers = getStoredMockUsers()
  persistStoredMockUsers([...storedUsers, newUser])

  return {
    success: true,
    session: buildSession(newUser),
    message: 'Tu cuenta quedó creada en el frontend y ya puedes entrar a tu perfil de cliente.',
  }
}

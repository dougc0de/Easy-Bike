<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import MapSection from './components/MapSection.vue'
import HomeView from './views/HomeView.vue'
import BikesView from './views/BikesView.vue'
import AboutView from './views/AboutView.vue'
import ContactView from './views/ContactView.vue'
import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import CustomerProfileView from './views/CustomerProfileView.vue'
import AdminPanelView from './views/AdminPanelView.vue'
import {
  aboutMilestones,
  aboutValues,
  footerColumns,
  footerMeta,
  homeBenefits,
  homeStats,
  loginHighlights,
  locationConfig,
  navigationItems,
} from './data/siteContent'
import {
  fetchBikeCatalog,
  fetchCurrentSession,
  fetchPublicLocationConfig,
  fetchReservationsForSession,
  hasStoredAccessToken,
  logoutUser,
  refreshUserSession,
} from './services/siteApi'
import type {
  AuthRole,
  AuthSession,
  BikeItem,
  LocationConfig,
  NavigationItem,
  PageId,
  ReservationSummary,
} from './types'

const AUTH_STORAGE_KEY = 'easybike-auth-session'
type CatalogLoadStatus = 'loading' | 'ready' | 'error'
type ReservationsLoadStatus = 'idle' | 'loading' | 'ready' | 'error'
type LocationLoadStatus = 'loading' | 'ready' | 'error'

const routes: Record<PageId, string> = {
  inicio: '#/inicio',
  bicicletas: '#/bicicletas',
  'sobre-nosotros': '#/sobre-nosotros',
  contactanos: '#/contactanos',
  login: '#/login',
  registrarse: '#/registrarse',
  'perfil-cliente': '#/perfil-cliente',
  'panel-admin': '#/panel-admin',
}

const authSession = ref<AuthSession | null>(loadAuthSession())
const pendingProtectedPage = ref<PageId | null>(null)
const currentPage = ref<PageId>(resolveInitialPage())
const bikes = ref<BikeItem[]>([])
const reservations = ref<ReservationSummary[]>([])
const publicLocationConfig = ref<LocationConfig | null>(null)
const catalogStatus = ref<CatalogLoadStatus>('loading')
const catalogMessage = ref('')
const reservationsStatus = ref<ReservationsLoadStatus>('idle')
const reservationsMessage = ref('')
const locationStatus = ref<LocationLoadStatus>('loading')
const locationMessage = ref('')
const loginEntryMessage = ref('')
const enableScrollReveal =
  typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

let revealObserver: IntersectionObserver | null = null
let revealFrameId: number | null = null

const headerItems = computed<NavigationItem[]>(() =>
  navigationItems.map((item) =>
    item.id === 'login'
      ? authSession.value
        ? {
            ...item,
            id: authSession.value.role === 'administracion' ? 'panel-admin' : 'perfil-cliente',
            label: authSession.value.role === 'administracion' ? 'Panel admin' : 'Mi perfil',
          }
        : item
      : item,
  ),
)
const headerSessionActionLabel = computed(() => (authSession.value ? 'Cerrar sesión' : undefined))

const homePreviewBikes = computed(() => bikes.value.slice(0, 3))
const resolvedLocationConfig = computed<LocationConfig>(() => publicLocationConfig.value ?? locationConfig)
const showMapSection = computed(() => currentPage.value === 'inicio' || currentPage.value === 'contactanos')

function resolvePage(hash: string): PageId {
  const cleanHash = hash.replace(/^#\//, '').trim()

  switch (cleanHash) {
    case 'bicicletas':
      return 'bicicletas'
    case 'sobre-nosotros':
      return 'sobre-nosotros'
    case 'contactanos':
      return 'contactanos'
    case 'login':
      return 'login'
    case 'registrarse':
      return 'registrarse'
    case 'perfil-cliente':
      return 'perfil-cliente'
    case 'panel-admin':
      return 'panel-admin'
    case 'inicio':
    default:
      return 'inicio'
  }
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'cliente' || value === 'administracion'
}

function isProtectedPage(page: PageId) {
  return page === 'perfil-cliente' || page === 'panel-admin'
}

function resolveAccessiblePage(page: PageId): PageId {
  if (page === 'perfil-cliente') {
    if (!authSession.value) {
      pendingProtectedPage.value = page
      loginEntryMessage.value = 'Para entrar a tu perfil primero debes iniciar sesión.'
      return 'login'
    }

    pendingProtectedPage.value = null
    return authSession.value.role === 'cliente' ? 'perfil-cliente' : 'panel-admin'
  }

  if (page === 'panel-admin') {
    if (!authSession.value) {
      pendingProtectedPage.value = page
      loginEntryMessage.value = 'Para entrar al panel administrativo primero debes iniciar sesión.'
      return 'login'
    }

    pendingProtectedPage.value = null
    return authSession.value.role === 'administracion' ? 'panel-admin' : 'perfil-cliente'
  }

  pendingProtectedPage.value = null
  return page
}

function resolveInitialPage(): PageId {
  if (typeof window === 'undefined') {
    return 'inicio'
  }

  const initialHash = window.location.hash || routes.inicio

  return resolveAccessiblePage(resolvePage(initialHash))
}

function syncPageWithHash(scrollBehavior: ScrollBehavior = 'smooth') {
  const requestedPage = resolvePage(window.location.hash)
  const nextPage = resolveAccessiblePage(requestedPage)

  if (requestedPage !== nextPage) {
    window.history.replaceState(null, '', `${window.location.pathname}${routes[nextPage]}`)
  }

  currentPage.value = nextPage

  if (nextPage !== 'login') {
    loginEntryMessage.value = ''
  }

  window.scrollTo({ top: 0, behavior: scrollBehavior })
}

function ensureInitialRoute() {
  if (!window.location.hash) {
    window.history.replaceState(null, '', `${window.location.pathname}#/inicio`)
  }

  syncPageWithHash('auto')
}

function handleHashChange() {
  syncPageWithHash()
}

function loadAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedSession) return null

  try {
    const parsedSession = JSON.parse(storedSession) as Partial<AuthSession>

    if (!parsedSession.email || !isAuthRole(parsedSession.role) || !parsedSession.loggedAt) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    const email = parsedSession.email
    const role = parsedSession.role
    const loggedAt = parsedSession.loggedAt
    const fallbackName = email.split('@')[0] ?? 'Easy Bike'
    const resolvedName: string = parsedSession.name?.trim() || fallbackName

    return {
      email,
      role,
      loggedAt,
      name: resolvedName,
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function persistAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

function hasOperationalLocationConfig(config: LocationConfig) {
  return [
    config.title,
    config.subtitle,
    config.address,
    config.schedule,
    config.contactPhone,
    config.contactEmail,
    config.ctaLabel,
    config.externalUrl,
  ].every((value) => value.trim().length > 0)
}

async function bootstrapAuthSession() {
  try {
    const result = hasStoredAccessToken()
      ? await fetchCurrentSession().catch(() => refreshUserSession())
      : await refreshUserSession()

    authSession.value = result.session
    persistAuthSession(result.session)
    await hydrateReservationsFromApi(result.session)

    if (pendingProtectedPage.value) {
      const nextPage =
        result.session.role === 'administracion' ? 'panel-admin' : 'perfil-cliente'
      pendingProtectedPage.value = null
      navigateTo(nextPage)
      return
    }

    if (isProtectedPage(currentPage.value)) {
      syncPageWithHash('auto')
    }
  } catch {
    authSession.value = null
    clearAuthSession()
    reservations.value = []
    reservationsStatus.value = 'idle'
    reservationsMessage.value = ''

    if (isProtectedPage(currentPage.value) || pendingProtectedPage.value) {
      syncPageWithHash('auto')
    }
  }
}

async function hydrateBikesFromApi() {
  catalogStatus.value = 'loading'
  catalogMessage.value = ''

  try {
    const catalog = await fetchBikeCatalog()
    bikes.value = catalog
    catalogStatus.value = 'ready'
    catalogMessage.value = catalog.length ? '' : 'Aún no hay bicicletas publicadas en el catálogo.'
  } catch (error) {
    bikes.value = []
    catalogStatus.value = 'error'
    catalogMessage.value =
      error instanceof Error ? error.message : 'No se pudo cargar el catálogo desde la API.'
    console.error('No se pudo cargar el catálogo desde la API.', error)
  }
}

async function hydrateReservationsFromApi(session: AuthSession | null) {
  if (!session) {
    reservations.value = []
    reservationsStatus.value = 'idle'
    reservationsMessage.value = ''
    return
  }

  reservationsStatus.value = 'loading'
  reservationsMessage.value = ''

  try {
    reservations.value = await fetchReservationsForSession(session)
    reservationsStatus.value = 'ready'
  } catch (error) {
    reservations.value = []
    reservationsStatus.value = 'error'
    reservationsMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudieron cargar las reservas vinculadas a esta sesión.'
    console.error('No se pudieron cargar las reservas desde la API.', error)
  }
}

async function hydratePublicLocationConfigFromApi() {
  locationStatus.value = 'loading'
  locationMessage.value = ''

  try {
    const location = await fetchPublicLocationConfig()

    if (!hasOperationalLocationConfig(location)) {
      publicLocationConfig.value = null
      locationStatus.value = 'error'
      locationMessage.value = 'La configuración pública de ubicación aún no está completa.'
      return
    }

    publicLocationConfig.value = location
    locationStatus.value = 'ready'
  } catch (error) {
    publicLocationConfig.value = null
    locationStatus.value = 'error'
    locationMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudo cargar la configuración pública de ubicación.'
    console.error('No se pudo cargar la configuración pública de ubicación.', error)
  }
}

function navigateTo(page: PageId) {
  const targetHash = routes[page]

  if (window.location.hash === targetHash) {
    syncPageWithHash()
    return
  }

  window.location.hash = targetHash
}

function openPage(page: PageId) {
  if (page === 'login') {
    loginEntryMessage.value = ''
  } else {
    const nextPage = resolveAccessiblePage(page)

    if (nextPage !== 'login') {
      loginEntryMessage.value = ''
    }

    navigateTo(nextPage)
    return
  }

  navigateTo(page)
}

function requestLogin(_page: PageId, message = 'Para reservar primero debes iniciar sesión.') {
  loginEntryMessage.value = message
  navigateTo('login')
}

async function handleLoginSuccess(session: AuthSession) {
  authSession.value = session
  persistAuthSession(session)
  loginEntryMessage.value = ''
  await Promise.all([hydrateBikesFromApi(), hydrateReservationsFromApi(session)])
  navigateTo(session.role === 'administracion' ? 'panel-admin' : 'perfil-cliente')
}

async function handleLogout() {
  await logoutUser().catch(() => undefined)
  authSession.value = null
  clearAuthSession()
  reservations.value = []
  loginEntryMessage.value = 'Tu sesión se cerró en este dispositivo.'
  navigateTo('login')
}

function handleReservationCreated(reservation: ReservationSummary) {
  reservations.value = [
    reservation,
    ...reservations.value.filter((currentReservation) => currentReservation.id !== reservation.id),
  ]
}

function handleBikeCreated(bike: BikeItem) {
  bikes.value = [bike, ...bikes.value.filter((currentBike) => currentBike.id !== bike.id)]
}

function handleAvailabilityUpdated(payload: {
  bikeId: string
  availability: BikeItem['availability']
}) {
  bikes.value = bikes.value.map((bike) =>
    bike.id === payload.bikeId ? { ...bike, availability: payload.availability } : bike,
  )
}

function disconnectScrollReveal() {
  revealObserver?.disconnect()
  revealObserver = null
}

function registerScrollRevealTargets() {
  if (typeof document === 'undefined') return

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>('.page-content > * > section, .map-section'),
  )

  if (!targets.length) return

  if (!enableScrollReveal) {
    targets.forEach((target) => target.classList.add('is-visible'))
    return
  }

  disconnectScrollReveal()

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -12% 0px',
    },
  )

  targets.forEach((target) => {
    target.classList.remove('is-visible')
    revealObserver?.observe(target)
  })
}

function scheduleScrollRevealRegistration() {
  if (typeof window === 'undefined') return

  if (revealFrameId !== null) {
    window.cancelAnimationFrame(revealFrameId)
  }

  revealFrameId = window.requestAnimationFrame(() => {
    revealFrameId = null
    registerScrollRevealTargets()
  })
}

watch(
  [currentPage, showMapSection],
  async () => {
    await nextTick()
    scheduleScrollRevealRegistration()
  },
  { flush: 'post' },
)

onMounted(async () => {
  ensureInitialRoute()
  window.addEventListener('hashchange', handleHashChange)
  scheduleScrollRevealRegistration()

  void hydrateBikesFromApi()
  void hydratePublicLocationConfigFromApi()

  if (authSession.value || hasStoredAccessToken() || isProtectedPage(currentPage.value)) {
    void bootstrapAuthSession()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange)
  disconnectScrollReveal()

  if (revealFrameId !== null) {
    window.cancelAnimationFrame(revealFrameId)
  }
})
</script>

<template>
  <div class="app-shell" :class="{ 'has-scroll-reveal': enableScrollReveal }">
    <SiteHeader
      :items="headerItems"
      :current-page="currentPage"
      :session-action-label="headerSessionActionLabel"
      @navigate="openPage"
      @session-action="handleLogout"
    />

    <main class="page-content">
      <HomeView
        v-if="currentPage === 'inicio'"
        :benefits="homeBenefits"
        :stats="homeStats"
        :bikes="homePreviewBikes"
        :catalog-status="catalogStatus"
        :catalog-message="catalogMessage"
        :is-logged-in="Boolean(authSession)"
        :session-email="authSession?.email ?? ''"
        @navigate="openPage"
        @request-login="requestLogin"
      />

      <BikesView
        v-else-if="currentPage === 'bicicletas'"
        :bikes="bikes"
        :catalog-status="catalogStatus"
        :catalog-message="catalogMessage"
        :is-logged-in="Boolean(authSession)"
        :session-email="authSession?.email ?? ''"
        :session-name="authSession?.name ?? ''"
        @navigate="openPage"
        @request-login="requestLogin"
      />

      <AboutView
        v-else-if="currentPage === 'sobre-nosotros'"
        :values="aboutValues"
        :milestones="aboutMilestones"
        @navigate="openPage"
      />

      <ContactView
        v-else-if="currentPage === 'contactanos'"
        :location="resolvedLocationConfig"
        :location-status="locationStatus"
        :location-message="locationMessage"
      />

      <CustomerProfileView
        v-else-if="currentPage === 'perfil-cliente' && authSession"
        :session="authSession"
        :bikes="bikes"
        :reservations="reservations"
        :catalog-status="catalogStatus"
        :catalog-message="catalogMessage"
        :reservations-status="reservationsStatus"
        :reservations-message="reservationsMessage"
        @navigate="openPage"
        @reservation-created="handleReservationCreated"
      />

      <AdminPanelView
        v-else-if="currentPage === 'panel-admin' && authSession"
        :session="authSession"
        :bikes="bikes"
        :reservations="reservations"
        :catalog-status="catalogStatus"
        :catalog-message="catalogMessage"
        :reservations-status="reservationsStatus"
        :reservations-message="reservationsMessage"
        @bike-created="handleBikeCreated"
        @availability-updated="handleAvailabilityUpdated"
        @reservation-created="handleReservationCreated"
      />

      <LoginView
        v-else-if="currentPage === 'login'"
        :highlights="loginHighlights"
        :entry-message="loginEntryMessage"
        :is-logged-in="Boolean(authSession)"
        :session-email="authSession?.email ?? ''"
        @navigate="openPage"
        @login-success="handleLoginSuccess"
      />

      <RegisterView
        v-else
        @navigate="openPage"
        @register-success="handleLoginSuccess"
      />
    </main>

    <MapSection
      v-if="showMapSection"
      :location="resolvedLocationConfig"
      :location-status="locationStatus"
      :location-message="locationMessage"
    />

    <SiteFooter
      :columns="footerColumns"
      :meta="footerMeta"
      @navigate="openPage"
    />
  </div>
</template>

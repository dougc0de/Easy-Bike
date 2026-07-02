<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
  bikeCatalog,
  contactCards,
  footerColumns,
  footerMeta,
  homeBenefits,
  homeStats,
  initialReservations,
  locationConfig,
  loginHighlights,
  navigationItems,
} from './data/siteContent'
import type {
  AuthRole,
  AuthSession,
  BikeItem,
  NavigationItem,
  PageId,
  ReservationSummary,
} from './types'

const AUTH_STORAGE_KEY = 'easybike-auth-session'
const BIKES_STORAGE_KEY = 'easybike-catalog'
const RESERVATIONS_STORAGE_KEY = 'easybike-reservations'

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

const currentPage = ref<PageId>('inicio')
const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000'
const authSession = ref<AuthSession | null>(loadAuthSession())
const bikes = ref<BikeItem[]>(loadStoredCollection(BIKES_STORAGE_KEY, bikeCatalog))
const reservations = ref<ReservationSummary[]>(
  loadStoredCollection(RESERVATIONS_STORAGE_KEY, initialReservations),
)
const loginEntryMessage = ref('')

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

function cloneCollection<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function loadStoredCollection<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return cloneCollection(fallback)

  const storedValue = window.localStorage.getItem(key)

  if (!storedValue) return cloneCollection(fallback)

  try {
    return JSON.parse(storedValue) as T
  } catch {
    window.localStorage.removeItem(key)
    return cloneCollection(fallback)
  }
}

function persistStoredCollection<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function resolveAccessiblePage(page: PageId): PageId {
  if (page === 'perfil-cliente') {
    if (!authSession.value) {
      loginEntryMessage.value = 'Para entrar a tu perfil primero debes iniciar sesión.'
      return 'login'
    }

    return authSession.value.role === 'cliente' ? 'perfil-cliente' : 'panel-admin'
  }

  if (page === 'panel-admin') {
    if (!authSession.value) {
      loginEntryMessage.value = 'Para entrar al panel administrativo primero debes iniciar sesión.'
      return 'login'
    }

    return authSession.value.role === 'administracion' ? 'panel-admin' : 'perfil-cliente'
  }

  return page
}

function syncPageWithHash() {
  const requestedPage = resolvePage(window.location.hash)
  const nextPage = resolveAccessiblePage(requestedPage)

  if (requestedPage !== nextPage) {
    window.history.replaceState(null, '', `${window.location.pathname}${routes[nextPage]}`)
  }

  currentPage.value = nextPage

  if (nextPage !== 'login') {
    loginEntryMessage.value = ''
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function ensureInitialRoute() {
  if (!window.location.hash) {
    window.history.replaceState(null, '', `${window.location.pathname}#/inicio`)
  }

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

function handleLoginSuccess(session: AuthSession) {
  authSession.value = session
  persistAuthSession(session)
  loginEntryMessage.value = ''
  navigateTo(session.role === 'administracion' ? 'panel-admin' : 'perfil-cliente')
}

function handleLogout() {
  authSession.value = null
  clearAuthSession()
  loginEntryMessage.value = 'Tu sesión se cerró en este dispositivo.'
  navigateTo('login')
}

function handleReservationCreated(reservation: ReservationSummary) {
  reservations.value = [reservation, ...reservations.value]
}

function handleBikeCreated(bike: BikeItem) {
  bikes.value = [bike, ...bikes.value]
}

function handleAvailabilityUpdated(payload: {
  bikeId: string
  availability: BikeItem['availability']
}) {
  bikes.value = bikes.value.map((bike) =>
    bike.id === payload.bikeId ? { ...bike, availability: payload.availability } : bike,
  )
}

watch(
  bikes,
  (value) => {
    persistStoredCollection(BIKES_STORAGE_KEY, value)
  },
  { deep: true },
)

watch(
  reservations,
  (value) => {
    persistStoredCollection(RESERVATIONS_STORAGE_KEY, value)
  },
  { deep: true },
)

onMounted(() => {
  ensureInitialRoute()
  window.addEventListener('hashchange', syncPageWithHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncPageWithHash)
})
</script>

<template>
  <div class="app-shell">
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
        :is-logged-in="Boolean(authSession)"
        :session-email="authSession?.email ?? ''"
        @navigate="openPage"
        @request-login="requestLogin"
      />

      <BikesView
        v-else-if="currentPage === 'bicicletas'"
        :bikes="bikes"
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
        :contact-cards="contactCards"
      />

      <CustomerProfileView
        v-else-if="currentPage === 'perfil-cliente' && authSession"
        :session="authSession"
        :bikes="bikes"
        :reservations="reservations"
        @navigate="openPage"
        @reservation-created="handleReservationCreated"
      />

      <AdminPanelView
        v-else-if="currentPage === 'panel-admin' && authSession"
        :session="authSession"
        :bikes="bikes"
        :reservations="reservations"
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
      :location="locationConfig"
      :api-base-url="apiBaseUrl"
    />

    <SiteFooter
      :columns="footerColumns"
      :meta="footerMeta"
      @navigate="openPage"
    />
  </div>
</template>

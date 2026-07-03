<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { submitReservation } from '../services/siteApi'
import type {
  AuthSession,
  BikeItem,
  PageId,
  ReservationPayload,
  ReservationSummary,
  ReservationVoucher,
} from '../types'

const props = defineProps<{
  session: AuthSession
  bikes: BikeItem[]
  reservations: ReservationSummary[]
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
  reservationCreated: [reservation: ReservationSummary]
}>()

const today = new Date().toISOString().split('T')[0]
const pickupTimeMin = '08:00'
const pickupTimeMax = '20:00'
const selectedBikeId = ref('')
const generatedVoucher = ref<ReservationVoucher | null>(null)
const successModal = ref<{ message: string; voucher: ReservationVoucher } | null>(null)
const isSubmitting = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const form = reactive<ReservationPayload>({
  fullName: props.session.name,
  email: props.session.email,
  phone: '',
  bikeId: '',
  date: '',
  time: '',
  duration: '24',
  pickupPoint: 'Punto Central Easy Bike',
  notes: '',
})

const reservableBikes = computed(() =>
  props.bikes.filter((bike) => bike.availability === 'Disponible' || bike.availability === 'Últimas unidades'),
)

const selectedBike = computed(
  () => reservableBikes.value.find((bike) => bike.id === selectedBikeId.value) ?? reservableBikes.value[0],
)

const customerReservations = computed(() =>
  [...props.reservations]
    .filter((reservation) => reservation.customerEmail === props.session.email)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
)

const activeReservations = computed(() =>
  customerReservations.value.filter((reservation) => reservation.status !== 'Completada'),
)

const pastReservations = computed(() =>
  customerReservations.value.filter((reservation) => reservation.status === 'Completada'),
)

const visibleVoucher = computed(() => {
  if (generatedVoucher.value) return generatedVoucher.value

  const latestReservation = customerReservations.value[0]

  if (!latestReservation) return null

  return {
    code: latestReservation.voucherCode,
    bikeName: latestReservation.bikeName,
    date: latestReservation.date,
    time: latestReservation.time,
    duration: latestReservation.duration,
    pickupPoint: latestReservation.pickupPoint,
    paymentMethod: latestReservation.paymentMethod,
    note: 'Este es tu último voucher generado. Preséntalo al retirar la bicicleta.',
  }
})

watch(
  () => props.session,
  (session) => {
    form.fullName = session.name
    form.email = session.email
  },
  { immediate: true },
)

watch(
  reservableBikes,
  (bikes) => {
    if (!bikes.length) {
      selectedBikeId.value = ''
      form.bikeId = ''
      return
    }

    const currentBikeStillAvailable = bikes.some((bike) => bike.id === selectedBikeId.value)

    if (!currentBikeStillAvailable) {
      const firstBike = bikes[0]

      if (!firstBike) return

      selectedBikeId.value = firstBike.id
    }

    form.bikeId = selectedBikeId.value
  },
  { immediate: true },
)

watch(selectedBikeId, (bikeId) => {
  form.bikeId = bikeId
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-419', {
    dateStyle: 'long',
  }).format(new Date(`${value}T12:00:00`))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-419', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getAvailabilityClass(availability: BikeItem['availability']) {
  if (availability === 'Disponible') return 'is-available'
  if (availability === 'Últimas unidades') return 'is-warning'
  return 'is-upcoming'
}

function getReservationStatusClass(status: ReservationSummary['status']) {
  if (status === 'Activa') return 'is-available'
  if (status === 'Pendiente de entrega') return 'is-warning'
  return 'is-upcoming'
}

function scrollToReservation() {
  document.getElementById('cliente-reserva')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function parseTimeToMinutes(value: string) {
  const [hoursPart = '', minutesPart = ''] = value.split(':')
  const hours = Number(hoursPart)
  const minutes = Number(minutesPart)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  return hours * 60 + minutes
}

function isPickupTimeAllowed(value: string) {
  const pickupMinutes = parseTimeToMinutes(value)
  const minMinutes = parseTimeToMinutes(pickupTimeMin)
  const maxMinutes = parseTimeToMinutes(pickupTimeMax)

  if (pickupMinutes === null || minMinutes === null || maxMinutes === null) return false

  return pickupMinutes >= minMinutes && pickupMinutes <= maxMinutes
}

async function onSubmit() {
  if (!selectedBike.value) {
    feedbackType.value = 'error'
    feedback.value = 'No hay bicicletas disponibles para reservar en este momento.'
    return
  }

  if (!form.fullName || !form.phone || !form.date || !form.time) {
    feedbackType.value = 'error'
    feedback.value = 'Completa nombre, teléfono, fecha y hora para generar la reserva.'
    return
  }

  if (!isPickupTimeAllowed(form.time)) {
    feedbackType.value = 'error'
    feedback.value = 'La hora de retiro debe estar entre 8:00 a.m. y 8:00 p.m.'
    return
  }

  isSubmitting.value = true

  try {
    const result = await submitReservation(
      {
        ...form,
        email: props.session.email,
        bikeId: selectedBike.value.id,
      },
    )

    emit('reservationCreated', result.reservation)
    generatedVoucher.value = result.voucher
    successModal.value = {
      message: result.message,
      voucher: result.voucher,
    }
    feedback.value = ''

    form.date = ''
    form.time = ''
    form.notes = ''
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value =
      error instanceof Error ? error.message : 'No se pudo procesar la reserva en este momento.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="customer-profile">
    <section class="customer-hero">
      <div class="customer-hero__corner customer-hero__corner--left" aria-hidden="true" />
      <div class="customer-hero__corner customer-hero__corner--right" aria-hidden="true" />

      <div class="container customer-hero__grid">
        <div class="customer-hero__content">
          <span class="eyebrow">Perfil del cliente</span>
          <h1 class="section-title">Hola, {{ session.name }}.</h1>
          <p class="section-copy">
            Aquí puedes reservar bicicletas disponibles, revisar el estado de tus solicitudes y
            mostrar tu voucher cuando retires la unidad.
          </p>

          <div class="customer-hero__notice">
            <strong>{{ activeReservations.length ? 'Tienes reservas en proceso' : 'Listo para una nueva reserva' }}</strong>
            <p>El pago se realiza físicamente al momento de retirar la bicicleta en el punto seleccionado.</p>
          </div>

          <div class="customer-hero__actions">
            <button class="primary-button" type="button" @click="scrollToReservation">
              Reservar bicicleta
            </button>
            <button class="ghost-button" type="button" @click="emit('navigate', 'bicicletas')">
              Ver catálogo público
            </button>
          </div>
        </div>

        <div class="customer-hero__metrics">
          <article class="customer-hero__metric">
            <strong>{{ activeReservations.length }}</strong>
            <span>reservas activas o pendientes</span>
          </article>
          <article class="customer-hero__metric">
            <strong>{{ pastReservations.length }}</strong>
            <span>reservas completadas</span>
          </article>
          <article class="customer-hero__metric">
            <strong>{{ reservableBikes.length }}</strong>
            <span>bicicletas aptas para reservar ahora</span>
          </article>
        </div>
      </div>
    </section>

    <section id="cliente-reserva" class="customer-booking">
      <div class="container customer-booking__stack">
        <div class="section-header customer-booking__header">
            <span class="eyebrow">Nueva reserva</span>
            <h2 class="section-title">Elige una bicicleta y confirma tu horario.</h2>
        </div>

        <div class="customer-booking__grid">
          <div class="customer-bike">

          <div v-if="reservableBikes.length" class="customer-bike__selector">
            <button
              v-for="bike in reservableBikes"
              :key="bike.id"
              type="button"
              class="customer-bike__option"
              :class="{ 'is-active': selectedBike?.id === bike.id }"
              @click="selectedBikeId = bike.id"
            >
              <strong>{{ bike.name }}</strong>
              <span>{{ bike.price }} · {{ bike.autonomy }}</span>
            </button>
          </div>

          <article v-if="selectedBike" class="customer-bike__feature">
            <div class="customer-bike__media">
              <img :src="selectedBike.imageUrl" :alt="selectedBike.imageAlt" class="customer-bike__image" />
            </div>

            <div class="customer-bike__details">
              <div class="customer-bike__headline">
                <h3>{{ selectedBike.name }}</h3>
                <span class="status-pill" :class="getAvailabilityClass(selectedBike.availability)">
                  {{ selectedBike.availability }}
                </span>
              </div>

              <p>{{ selectedBike.detail }}</p>

              <ul class="customer-bike__facts">
                <li>{{ selectedBike.category }}</li>
                <li>{{ selectedBike.price }}</li>
                <li>{{ selectedBike.autonomy }}</li>
                <li>{{ selectedBike.recommendedFor }}</li>
              </ul>
            </div>
          </article>

          <p v-else class="customer-bike__empty">
            En este momento no hay bicicletas listas para reservar. El administrador podrá
            habilitarlas desde su panel.
          </p>
          </div>

          <form class="card-surface customer-form" @submit.prevent="onSubmit">
          <div class="field-grid two-columns">
            <div class="field">
              <label for="customer-name">Nombre completo</label>
              <input id="customer-name" v-model="form.fullName" type="text" placeholder="Tu nombre" />
            </div>

            <div class="field">
              <label for="customer-email">Correo asociado</label>
              <input id="customer-email" :value="session.email" type="email" readonly />
            </div>
          </div>

          <div class="field-grid two-columns">
            <div class="field">
              <label for="customer-phone">Teléfono</label>
              <input id="customer-phone" v-model="form.phone" type="tel" placeholder="+00 123 456 789" />
            </div>

            <div class="field">
              <label for="customer-duration">Duración</label>
              <select id="customer-duration" v-model="form.duration">
                <option value="4">4 horas</option>
                <option value="8">8 horas</option>
                <option value="12">12 horas</option>
                <option value="24">24 horas</option>
              </select>
            </div>
          </div>

          <div class="field-grid two-columns">
            <div class="field">
              <label for="customer-date">Fecha</label>
              <input id="customer-date" v-model="form.date" :min="today" type="date" />
            </div>

            <div class="field">
              <label for="customer-time">Hora de retiro</label>
              <input
                id="customer-time"
                v-model="form.time"
                :min="pickupTimeMin"
                :max="pickupTimeMax"
                type="time"
              />
            </div>
          </div>

          <div class="field">
            <label for="customer-pickup">Punto de recojo</label>
            <input id="customer-pickup" v-model="form.pickupPoint" type="text" readonly />
          </div>

          <div class="field">
            <label for="customer-notes">Notas adicionales</label>
            <textarea
              id="customer-notes"
              v-model="form.notes"
              placeholder="Escribe alguna referencia o necesidad extra para tu retiro."
            />
          </div>

          <p class="helper-text">
            El voucher se genera al instante y el pago queda marcado como físico al retirar la
            bicicleta.
          </p>

          <div v-if="feedback" class="feedback" :class="feedbackType === 'success' ? 'is-success' : 'is-error'">
            {{ feedback }}
          </div>

          <button class="secondary-button" type="submit" :disabled="isSubmitting || !selectedBike">
            {{ isSubmitting ? 'Generando voucher...' : 'Confirmar reserva' }}
          </button>
          </form>
        </div>
      </div>
    </section>

    <section class="customer-voucher">
      <div class="container">
        <div class="section-header customer-voucher__header">
          <span class="eyebrow">Voucher</span>
          <h2 class="section-title">Tu comprobante queda visible sin recargar la página.</h2>
        </div>

        <article v-if="visibleVoucher" class="customer-voucher__card">
          <div class="customer-voucher__topline">
            <strong>{{ visibleVoucher.code }}</strong>
            <span>Easy Bike</span>
          </div>

          <div class="customer-voucher__grid">
            <div>
              <small>Bicicleta</small>
              <p>{{ visibleVoucher.bikeName }}</p>
            </div>
            <div>
              <small>Fecha</small>
              <p>{{ formatDate(visibleVoucher.date) }}</p>
            </div>
            <div>
              <small>Hora</small>
              <p>{{ visibleVoucher.time }}</p>
            </div>
            <div>
              <small>Duración</small>
              <p>{{ visibleVoucher.duration }}</p>
            </div>
            <div>
              <small>Punto de recojo</small>
              <p>{{ visibleVoucher.pickupPoint }}</p>
            </div>
            <div>
              <small>Pago</small>
              <p>{{ visibleVoucher.paymentMethod }}</p>
            </div>
          </div>

          <p class="customer-voucher__note">{{ visibleVoucher.note }}</p>
        </article>

        <div v-else class="customer-voucher__empty">
          <p>Cuando completes una reserva aquí aparecerá tu voucher con código y detalles de retiro.</p>
        </div>
      </div>
    </section>

    <section class="customer-history">
      <div class="container customer-history__grid">
        <div>
          <div class="section-header customer-history__header">
            <span class="eyebrow">Reservas activas</span>
            <h2 class="section-title">Seguimiento rápido de tus solicitudes.</h2>
          </div>

          <div v-if="activeReservations.length" class="customer-history__list">
            <article
              v-for="reservation in activeReservations"
              :key="reservation.id"
              class="customer-history__item"
            >
              <div class="customer-history__item-head">
                <strong>{{ reservation.bikeName }}</strong>
                <span class="status-pill" :class="getReservationStatusClass(reservation.status)">
                  {{ reservation.status }}
                </span>
              </div>
              <p>
                {{ formatDate(reservation.date) }} · {{ reservation.time }} · {{ reservation.duration }} ·
                {{ reservation.pickupPoint }}
              </p>
              <small>{{ reservation.voucherCode }} · {{ formatCurrency(reservation.amount) }}</small>
            </article>
          </div>

          <p v-else class="customer-history__empty">Aún no tienes reservas activas o pendientes de entrega.</p>
        </div>

        <div>
          <div class="section-header customer-history__header">
            <span class="eyebrow">Historial</span>
            <h2 class="section-title">Reservas anteriores.</h2>
          </div>

          <div v-if="pastReservations.length" class="customer-history__list">
            <article
              v-for="reservation in pastReservations"
              :key="reservation.id"
              class="customer-history__item"
            >
              <div class="customer-history__item-head">
                <strong>{{ reservation.bikeName }}</strong>
                <span class="status-pill" :class="getReservationStatusClass(reservation.status)">
                  {{ reservation.status }}
                </span>
              </div>
              <p>{{ formatDate(reservation.date) }} · {{ reservation.time }} · {{ reservation.duration }}</p>
              <small>{{ reservation.voucherCode }} · {{ formatCurrency(reservation.amount) }}</small>
            </article>
          </div>

          <p v-else class="customer-history__empty">Todavía no hay reservas completadas en tu historial.</p>
        </div>
      </div>
    </section>

    <div v-if="successModal" class="customer-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-success-title">
      <div class="customer-modal__backdrop" @click="successModal = null" />

      <article class="customer-modal__card">
        <span class="eyebrow customer-modal__eyebrow">Reserva confirmada</span>
        <h2 id="reservation-success-title">Tu reserva quedó lista.</h2>
        <p class="customer-modal__message">{{ successModal.message }}</p>

        <div class="customer-modal__grid">
          <div>
            <small>Código de voucher</small>
            <strong>{{ successModal.voucher.code }}</strong>
          </div>
          <div>
            <small>Bicicleta</small>
            <strong>{{ successModal.voucher.bikeName }}</strong>
          </div>
          <div>
            <small>Fecha</small>
            <strong>{{ formatDate(successModal.voucher.date) }}</strong>
          </div>
          <div>
            <small>Hora</small>
            <strong>{{ successModal.voucher.time }}</strong>
          </div>
          <div>
            <small>Punto de recojo</small>
            <strong>{{ successModal.voucher.pickupPoint }}</strong>
          </div>
        </div>

        <button class="secondary-button" type="button" @click="successModal = null">
          Entendido
        </button>
      </article>
    </div>
  </div>
</template>

<style scoped>
.customer-profile {
  display: grid;
  gap: 0;
}

.customer-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 3.5rem;
  background: #fff;
}

.customer-hero__corner {
  position: absolute;
  background: #2da8c1;
  animation: customer-float 8s ease-in-out infinite;
}

.customer-hero__corner--left {
  top: 0;
  left: 0;
  width: 160px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 18%, 63% 45%, 63% 78%, 0 100%);
}

.customer-hero__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 96px;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.2s;
}

.customer-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.customer-hero__content {
  display: grid;
  gap: 1rem;
  max-width: 54rem;
}

.customer-hero__notice {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 0 1rem 1rem;
  border-left: 4px solid var(--brand-orange);
  background: linear-gradient(90deg, rgba(242, 135, 5, 0.1), rgba(255, 255, 255, 0.15));
}

.customer-hero__notice strong,
.customer-hero__notice p {
  margin: 0;
}

.customer-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.customer-hero__metrics {
  display: grid;
  gap: 1rem;
}

.customer-hero__metric {
  display: grid;
  gap: 0.35rem;
  padding: 1.1rem 1rem;
  border-top: 4px solid rgba(45, 168, 193, 0.92);
  background: rgba(247, 250, 251, 0.98);
}

.customer-hero__metric strong {
  font-size: 1.9rem;
  color: var(--brand-teal);
}

.customer-hero__metric span {
  color: var(--ink-soft);
}

.customer-booking {
  padding: 2.5rem 0 3rem;
  background: #eef2f3;
}

.customer-booking__stack {
  display: grid;
  gap: 1.25rem;
}

.customer-booking__header {
  margin-bottom: 0;
  max-width: 42rem;
}

.customer-booking__header .section-title {
  font-size: clamp(2.2rem, 4vw, 3.3rem);
  max-width: 14ch;
}

.customer-booking__grid {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}

.customer-bike {
  display: grid;
  gap: 1rem;
}

.customer-bike__selector {
  display: grid;
  gap: 0.7rem;
}

.customer-bike__option {
  display: grid;
  justify-items: start;
  gap: 0.2rem;
  padding: 0.85rem 0 0.85rem 1rem;
  border: 0;
  border-left: 4px solid rgba(19, 33, 41, 0.12);
  background: rgba(255, 255, 255, 0.7);
  text-align: left;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.customer-bike__option.is-active,
.customer-bike__option:hover {
  transform: translateX(4px);
  border-left-color: var(--brand-orange);
  background: rgba(255, 255, 255, 0.96);
}

.customer-bike__option span {
  color: var(--ink-soft);
}

.customer-bike__feature {
  display: grid;
  gap: 1rem;
  padding-top: 0.1rem;
}

.customer-bike__media {
  min-height: 230px;
  display: grid;
  place-items: center;
  padding: 0.85rem;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 16px 30px rgba(20, 59, 53, 0.08);
}

.customer-bike__image {
  width: min(100%, 420px);
  max-height: 205px;
  object-fit: contain;
}

.customer-bike__details {
  display: grid;
  gap: 1rem;
}

.customer-bike__headline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.customer-bike__headline h3,
.customer-bike__details p {
  margin: 0;
}

.customer-bike__details p {
  color: var(--ink-soft);
}

.customer-bike__facts {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.customer-bike__facts li {
  padding-left: 1rem;
  border-left: 3px solid rgba(45, 168, 193, 0.9);
}

.customer-bike__empty {
  margin: 0;
  color: var(--ink-soft);
}

.customer-form {
  display: grid;
  gap: 1rem;
  padding: 1.4rem;
  align-content: start;
}

.customer-voucher {
  padding: 2.5rem 0 3rem;
  background: #fff;
}

.customer-voucher__header {
  margin-bottom: 1.6rem;
}

.customer-voucher__card {
  display: grid;
  gap: 1.4rem;
  padding: 1.4rem;
  border: 2px dashed rgba(20, 59, 53, 0.28);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(223, 244, 212, 0.52), rgba(255, 255, 255, 0.96));
}

.customer-voucher__topline {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
}

.customer-voucher__topline strong {
  font-size: 1.35rem;
  color: var(--brand-teal);
}

.customer-voucher__topline span {
  font-weight: 700;
  color: var(--brand-cyan-deep);
}

.customer-voucher__grid {
  display: grid;
  gap: 1rem;
}

.customer-voucher__grid small,
.customer-voucher__grid p,
.customer-voucher__note {
  margin: 0;
}

.customer-voucher__grid small {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--ink-soft);
}

.customer-voucher__grid p {
  font-weight: 700;
}

.customer-voucher__note {
  color: var(--ink-soft);
}

.customer-voucher__empty {
  padding: 1.15rem 0 0;
  color: var(--ink-soft);
}

.customer-voucher__empty p {
  margin: 0;
}

.customer-history {
  padding: 2.5rem 0 4rem;
  background: #eef2f3;
}

.customer-history__grid {
  display: grid;
  gap: 1.8rem;
}

.customer-history__header {
  margin-bottom: 1.4rem;
}

.customer-history__list {
  display: grid;
  gap: 1rem;
}

.customer-history__item {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.92);
}

.customer-history__item-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.customer-history__item p,
.customer-history__item small {
  margin: 0;
}

.customer-history__item p {
  color: var(--ink-soft);
}

.customer-history__item small {
  color: var(--brand-cyan-deep);
  font-weight: 700;
}

.customer-history__empty {
  margin: 0;
  color: var(--ink-soft);
}

.customer-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.customer-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(19, 33, 41, 0.5);
  backdrop-filter: blur(4px);
}

.customer-modal__card {
  position: relative;
  z-index: 1;
  width: min(100%, 720px);
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 28px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(233, 246, 249, 0.96));
  box-shadow: 0 28px 54px rgba(19, 33, 41, 0.22);
}

.customer-modal__eyebrow {
  background: rgba(121, 192, 92, 0.16);
  color: #2f6d1c;
}

.customer-modal__card h2,
.customer-modal__message {
  margin: 0;
}

.customer-modal__message {
  color: var(--ink-soft);
  font-size: 1.04rem;
}

.customer-modal__grid {
  display: grid;
  gap: 0.9rem;
}

.customer-modal__grid small {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--ink-soft);
}

.customer-modal__grid strong {
  color: var(--brand-teal);
}

@keyframes customer-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 900px) {
  .customer-hero__grid,
  .customer-history__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .customer-booking__grid {
    grid-template-columns: minmax(320px, 0.94fr) minmax(380px, 1.06fr);
  }

  .customer-bike__feature {
    grid-template-columns: minmax(190px, 230px) minmax(0, 1fr);
    align-items: center;
  }

  .customer-hero__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .customer-voucher__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .customer-modal__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .customer-hero {
    padding-top: 7.2rem;
  }

  .customer-hero__corner--left {
    width: 112px;
    height: 160px;
  }

  .customer-hero__corner--right {
    width: 105px;
    height: 72px;
  }

  .customer-bike__media {
    min-height: 230px;
  }
}
</style>

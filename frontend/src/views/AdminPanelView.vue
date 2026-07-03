<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  createBikeRecord,
  submitReservation,
  updateBikeAvailabilityStatus,
} from '../services/siteApi'
import type {
  AuthSession,
  BikeItem,
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
  bikeCreated: [bike: BikeItem]
  availabilityUpdated: [payload: { bikeId: string; availability: BikeItem['availability'] }]
  reservationCreated: [reservation: ReservationSummary]
}>()

const today = new Date().toISOString().split('T')[0]
const pickupTimeMin = '08:00'
const pickupTimeMax = '20:00'
const isSavingBike = ref(false)
const bikeFeedback = ref('')
const bikeFeedbackType = ref<'success' | 'error'>('success')
const isCreatingReservation = ref(false)
const reservationFeedback = ref('')
const reservationFeedbackType = ref<'success' | 'error'>('success')
const selectedReservationBikeId = ref('')
const generatedVoucher = ref<ReservationVoucher | null>(null)
const successModal = ref<{ message: string; voucher: ReservationVoucher } | null>(null)

const availabilityOptions: BikeItem['availability'][] = ['Disponible', 'Últimas unidades', 'Próximamente']

const bikeForm = reactive({
  name: '',
  category: 'Urbana',
  price: 'Desde $24 / 24 h',
  autonomy: 'Hasta 40 km',
  availability: 'Disponible' as BikeItem['availability'],
  description: '',
  imageUrl: '',
})

const totalRevenue = computed(() =>
  props.reservations.reduce((sum, reservation) => sum + reservation.amount, 0),
)

const pendingDeliveries = computed(() =>
  props.reservations.filter((reservation) => reservation.status === 'Pendiente de entrega').length,
)

const availableCount = computed(() =>
  props.bikes.filter((bike) => bike.availability === 'Disponible').length,
)

const warningCount = computed(() =>
  props.bikes.filter((bike) => bike.availability === 'Últimas unidades').length,
)

const reservableBikes = computed(() =>
  props.bikes.filter((bike) => bike.availability === 'Disponible' || bike.availability === 'Últimas unidades'),
)

const availabilityByCategory = computed(() => {
  const grouped = new Map<
    string,
    {
      category: string
      availableCount: number
      lastUnitsCount: number
      totalCount: number
    }
  >()

  for (const bike of props.bikes) {
    const current = grouped.get(bike.category) ?? {
      category: bike.category,
      availableCount: 0,
      lastUnitsCount: 0,
      totalCount: 0,
    }

    current.totalCount += 1

    if (bike.availability === 'Disponible') {
      current.availableCount += 1
    }

    if (bike.availability === 'Últimas unidades') {
      current.lastUnitsCount += 1
    }

    grouped.set(bike.category, current)
  }

  return Array.from(grouped.values()).sort((left, right) => left.category.localeCompare(right.category))
})

const selectedReservationBike = computed(
  () =>
    reservableBikes.value.find((bike) => bike.id === selectedReservationBikeId.value) ??
    reservableBikes.value[0],
)

const recentReservations = computed(() =>
  [...props.reservations]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 6),
)

const storeReservationForm = reactive<ReservationPayload>({
  fullName: '',
  email: '',
  phone: '',
  bikeId: '',
  date: '',
  time: '',
  duration: '24',
  pickupPoint: 'Punto Central Easy Bike',
  notes: '',
})

watch(
  reservableBikes,
  (bikes) => {
    if (!bikes.length) {
      selectedReservationBikeId.value = ''
      storeReservationForm.bikeId = ''
      return
    }

    const currentBikeStillAvailable = bikes.some((bike) => bike.id === selectedReservationBikeId.value)

    if (!currentBikeStillAvailable) {
      const firstBike = bikes[0]

      if (!firstBike) return

      selectedReservationBikeId.value = firstBike.id
    }

    storeReservationForm.bikeId = selectedReservationBikeId.value
  },
  { immediate: true },
)

watch(selectedReservationBikeId, (bikeId) => {
  storeReservationForm.bikeId = bikeId
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-419', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-419', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat('es-419', {
    dateStyle: 'long',
  }).format(new Date(`${value}T12:00:00`))
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

function pickAccent(category: string) {
  const normalizedCategory = category.toLowerCase()

  if (normalizedCategory.includes('plegable')) return '#167f96'
  if (normalizedCategory.includes('todo')) return '#143b35'
  if (normalizedCategory.includes('confort')) return '#53b9cc'
  return '#f28705'
}

function buildRecommendedUse(category: string) {
  const normalizedCategory = category.toLowerCase()

  if (normalizedCategory.includes('plegable')) return 'Trayectos combinados y espacios reducidos.'
  if (normalizedCategory.includes('todo')) return 'Recorridos mixtos y rutas más exigentes.'
  if (normalizedCategory.includes('confort')) return 'Usuarios que priorizan comodidad y estabilidad.'
  return 'Movilidad urbana y reservas rápidas dentro de la ciudad.'
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
  if (
    !bikeForm.name.trim() ||
    !bikeForm.category.trim() ||
    !bikeForm.price.trim() ||
    !bikeForm.autonomy.trim() ||
    !bikeForm.description.trim()
  ) {
    bikeFeedbackType.value = 'error'
    bikeFeedback.value = 'Completa nombre, categoría, precio, autonomía y descripción para registrar la bicicleta.'
    return
  }

  isSavingBike.value = true

  try {
    const baseDescription = bikeForm.description.trim()
    const shortDescription =
      baseDescription.length > 92 ? `${baseDescription.slice(0, 89).trim()}...` : baseDescription

    const bikeDraft: Omit<BikeItem, 'id'> = {
      name: bikeForm.name.trim(),
      category: bikeForm.category.trim(),
      shortDescription,
      detail: baseDescription,
      price: bikeForm.price.trim(),
      autonomy: bikeForm.autonomy.trim(),
      availability: bikeForm.availability,
      accent: pickAccent(bikeForm.category),
      recommendedFor: buildRecommendedUse(bikeForm.category),
      imageUrl: bikeForm.imageUrl.trim() || '/images/carruselBici1.jpg',
      imageAlt: `${bikeForm.name.trim()} Easy Bike`,
    }

    const bike = await createBikeRecord(bikeDraft)
    emit('bikeCreated', bike)
    bikeFeedbackType.value = 'success'
    bikeFeedback.value = 'La bicicleta quedó registrada en el backend y ya se refleja en el frontend.'

    bikeForm.name = ''
    bikeForm.category = 'Urbana'
    bikeForm.price = 'Desde $24 / 24 h'
    bikeForm.autonomy = 'Hasta 40 km'
    bikeForm.availability = 'Disponible'
    bikeForm.description = ''
    bikeForm.imageUrl = ''
  } catch (error) {
    bikeFeedbackType.value = 'error'
    bikeFeedback.value =
      error instanceof Error ? error.message : 'No se pudo registrar la bicicleta en este momento.'
  } finally {
    isSavingBike.value = false
  }
}

async function updateAvailability(bikeId: string, availability: BikeItem['availability']) {
  try {
    const updatedBike = await updateBikeAvailabilityStatus(bikeId, availability)

    emit('availabilityUpdated', {
      bikeId: updatedBike.id,
      availability: updatedBike.availability,
    })

    bikeFeedbackType.value = 'success'
    bikeFeedback.value = `La disponibilidad de ${updatedBike.name} quedó actualizada a ${updatedBike.availability}.`
  } catch (error) {
    bikeFeedbackType.value = 'error'
    bikeFeedback.value =
      error instanceof Error ? error.message : 'No se pudo actualizar la disponibilidad en este momento.'
  }
}

async function onStoreReservationSubmit() {
  if (!selectedReservationBike.value) {
    reservationFeedbackType.value = 'error'
    reservationFeedback.value = 'No hay bicicletas reservables en este momento para atención en tienda.'
    return
  }

  if (
    !storeReservationForm.fullName.trim() ||
    !storeReservationForm.email.trim() ||
    !storeReservationForm.phone.trim() ||
    !storeReservationForm.date ||
    !storeReservationForm.time
  ) {
    reservationFeedbackType.value = 'error'
    reservationFeedback.value = 'Completa nombre, correo, teléfono, fecha y hora para generar la reserva.'
    return
  }

  if (!isPickupTimeAllowed(storeReservationForm.time)) {
    reservationFeedbackType.value = 'error'
    reservationFeedback.value = 'La hora de retiro debe estar entre 8:00 a.m. y 8:00 p.m.'
    return
  }

  isCreatingReservation.value = true

  try {
    const result = await submitReservation(
      {
        ...storeReservationForm,
        email: storeReservationForm.email.trim().toLowerCase(),
        bikeId: selectedReservationBike.value.id,
      },
      { mode: 'admin-store' },
    )

    emit('reservationCreated', result.reservation)
    generatedVoucher.value = result.voucher
    successModal.value = {
      message: result.message,
      voucher: result.voucher,
    }
    reservationFeedback.value = ''

    storeReservationForm.fullName = ''
    storeReservationForm.email = ''
    storeReservationForm.phone = ''
    storeReservationForm.date = ''
    storeReservationForm.time = ''
    storeReservationForm.duration = '24'
    storeReservationForm.notes = ''
  } catch (error) {
    reservationFeedbackType.value = 'error'
    reservationFeedback.value =
      error instanceof Error ? error.message : 'No se pudo procesar la reserva de tienda en este momento.'
  } finally {
    isCreatingReservation.value = false
  }
}
</script>

<template>
  <div class="admin-panel">
    <section class="admin-hero">
      <div class="admin-hero__corner admin-hero__corner--left" aria-hidden="true" />
      <div class="admin-hero__corner admin-hero__corner--right" aria-hidden="true" />

      <div class="container admin-hero__grid">
        <div class="admin-hero__content">
          <span class="eyebrow">Panel del administrador</span>
          <h1 class="section-title">Gestión central para {{ session.name }}.</h1>
          <p class="section-copy">
            Desde aquí el equipo puede cargar bicicletas, volverlas a poner disponibles después de
            la entrega y seguir el movimiento contable generado por las reservas registradas.
          </p>

          <div class="admin-hero__notice">
            <strong>Flujo listo para pruebas del equipo</strong>
            <p>El panel ya quedó conectado a la API para que el resto del equipo continúe sobre una base real.</p>
          </div>
        </div>

        <div class="admin-hero__metrics">
          <article class="admin-hero__metric">
            <strong>{{ props.bikes.length }}</strong>
            <span>bicicletas registradas</span>
          </article>
          <article class="admin-hero__metric">
            <strong>{{ availableCount }}</strong>
            <span>listas para reservar</span>
          </article>
          <article class="admin-hero__metric">
            <strong>{{ pendingDeliveries }}</strong>
            <span>entregas pendientes</span>
          </article>
          <article class="admin-hero__metric">
            <strong>{{ formatCurrency(totalRevenue) }}</strong>
            <span>monto acumulado de reservas</span>
          </article>
        </div>
      </div>
    </section>

    <section class="admin-management">
      <div class="container admin-management__grid">
        <form class="card-surface admin-form" @submit.prevent="onSubmit">
          <div class="section-header admin-form__header">
            <span class="eyebrow">Agregar bicicleta</span>
            <h2 class="section-title">Registra un nuevo modelo.</h2>
          </div>

          <div class="field">
            <label for="admin-bike-name">Nombre</label>
            <input id="admin-bike-name" v-model="bikeForm.name" type="text" placeholder="Bicicleta eléctrica urbana" />
          </div>

          <div class="field-grid two-columns">
            <div class="field">
              <label for="admin-bike-category">Categoría</label>
              <input id="admin-bike-category" v-model="bikeForm.category" type="text" placeholder="Urbana" />
            </div>

            <div class="field">
              <label for="admin-bike-availability">Disponibilidad inicial</label>
              <select id="admin-bike-availability" v-model="bikeForm.availability">
                <option v-for="option in availabilityOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </div>

          <div class="field-grid two-columns">
            <div class="field">
              <label for="admin-bike-price">Precio</label>
              <input id="admin-bike-price" v-model="bikeForm.price" type="text" placeholder="Desde $24 / 24 h" />
            </div>

            <div class="field">
              <label for="admin-bike-autonomy">Autonomía</label>
              <input id="admin-bike-autonomy" v-model="bikeForm.autonomy" type="text" placeholder="Hasta 40 km" />
            </div>
          </div>

          <div class="field">
            <label for="admin-bike-image">Imagen opcional</label>
            <input
              id="admin-bike-image"
              v-model="bikeForm.imageUrl"
              type="text"
              placeholder="/images/tu-bicicleta.jpg"
            />
          </div>

          <div class="field">
            <label for="admin-bike-description">Descripción</label>
            <textarea
              id="admin-bike-description"
              v-model="bikeForm.description"
              placeholder="Describe el uso ideal, comodidad y tipo de recorrido recomendado."
            />
          </div>

          <p class="helper-text">
            Este formulario registra la bicicleta en backend y la deja visible también en las vistas públicas del sitio.
          </p>

          <div v-if="bikeFeedback" class="feedback" :class="bikeFeedbackType === 'success' ? 'is-success' : 'is-error'">
            {{ bikeFeedback }}
          </div>

          <button class="secondary-button" type="submit" :disabled="isSavingBike">
            {{ isSavingBike ? 'Guardando...' : 'Registrar bicicleta' }}
          </button>
        </form>

        <div class="admin-inventory">
          <div class="section-header admin-inventory__header">
            <span class="eyebrow">Gestión de disponibilidad</span>
            <h2 class="section-title">Catálogo actual y control por estado.</h2>
            <p class="section-copy">
              Usa estas acciones para volver a publicar una bicicleta tras la entrega o dejar claro
              si quedan pocas unidades.
            </p>
          </div>

          <div class="admin-inventory__stats">
            <span>{{ availableCount }} disponibles</span>
            <span>{{ warningCount }} en últimas unidades</span>
            <span>{{ props.bikes.length - availableCount - warningCount }} próximamente</span>
          </div>

          <div class="admin-availability">
            <span class="eyebrow">Disponibles por tipo de bicicleta</span>
            <p class="section-copy">
              Este resumen ya deja visible el bloque que luego backend podrá alimentar desde base de
              datos o API sin rehacer la interfaz.
            </p>

            <div v-if="availabilityByCategory.length" class="admin-availability__list">
              <article
                v-for="group in availabilityByCategory"
                :key="group.category"
                class="admin-availability__item"
              >
                <div class="admin-availability__head">
                  <strong>{{ group.category }}</strong>
                  <span>{{ group.availableCount }} disponibles</span>
                </div>

                <div class="admin-availability__meta">
                  <span>{{ group.lastUnitsCount }} últimas unidades</span>
                  <span>{{ group.totalCount }} total registradas</span>
                </div>
              </article>
            </div>
          </div>

          <div class="admin-inventory__list">
            <article v-for="bike in props.bikes" :key="bike.id" class="admin-bike">
              <div class="admin-bike__media">
                <img :src="bike.imageUrl" :alt="bike.imageAlt" class="admin-bike__image" />
              </div>

              <div class="admin-bike__body">
                <div class="admin-bike__topline">
                  <div>
                    <h3>{{ bike.name }}</h3>
                    <p>{{ bike.category }} · {{ bike.price }} · {{ bike.autonomy }}</p>
                  </div>
                  <span class="status-pill" :class="getAvailabilityClass(bike.availability)">
                    {{ bike.availability }}
                  </span>
                </div>

                <p class="admin-bike__copy">{{ bike.detail }}</p>

                <div class="admin-bike__actions">
                  <button
                    v-for="option in availabilityOptions"
                    :key="option"
                    type="button"
                    class="admin-bike__action"
                    :class="{ 'is-active': bike.availability === option }"
                    @click="updateAvailability(bike.id, option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="admin-store">
      <div class="container admin-store__stack">
        <div class="section-header admin-store__header">
          <span class="eyebrow">Reservar en tienda</span>
          <h2 class="section-title">Registra una reserva presencial desde el panel.</h2>
          <p class="section-copy">
            Este flujo puede usarlo quien atiende en tienda. Queda funcional en frontend y listo
            para que backend después conecte la lógica real.
          </p>
        </div>

        <div class="admin-store__grid">
          <div class="admin-store__catalog">
            <div v-if="reservableBikes.length" class="admin-store__selector">
              <button
                v-for="bike in reservableBikes"
                :key="bike.id"
                type="button"
                class="admin-store__option"
                :class="{ 'is-active': selectedReservationBike?.id === bike.id }"
                @click="selectedReservationBikeId = bike.id"
              >
                <strong>{{ bike.name }}</strong>
                <span>{{ bike.category }} · {{ bike.price }} · {{ bike.autonomy }}</span>
              </button>
            </div>

            <article v-if="selectedReservationBike" class="admin-store__bike">
              <div class="admin-store__media">
                <img
                  :src="selectedReservationBike.imageUrl"
                  :alt="selectedReservationBike.imageAlt"
                  class="admin-store__image"
                />
              </div>

              <div class="admin-store__details">
                <div class="admin-store__headline">
                  <h3>{{ selectedReservationBike.name }}</h3>
                  <span class="status-pill" :class="getAvailabilityClass(selectedReservationBike.availability)">
                    {{ selectedReservationBike.availability }}
                  </span>
                </div>

                <p>{{ selectedReservationBike.detail }}</p>

                <ul class="admin-store__facts">
                  <li>{{ selectedReservationBike.category }}</li>
                  <li>{{ selectedReservationBike.price }}</li>
                  <li>{{ selectedReservationBike.autonomy }}</li>
                  <li>{{ selectedReservationBike.recommendedFor }}</li>
                </ul>
              </div>
            </article>

            <p v-else class="admin-store__empty">
              No hay bicicletas listas para reservar desde tienda en este momento.
            </p>
          </div>

          <form class="card-surface admin-store__form" @submit.prevent="onStoreReservationSubmit">
            <div class="field-grid two-columns">
              <div class="field">
                <label for="admin-store-name">Nombre completo</label>
                <input
                  id="admin-store-name"
                  v-model="storeReservationForm.fullName"
                  type="text"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div class="field">
                <label for="admin-store-email">Correo electrónico</label>
                <input
                  id="admin-store-email"
                  v-model="storeReservationForm.email"
                  type="email"
                  placeholder="cliente@correo.com"
                />
              </div>
            </div>

            <div class="field-grid two-columns">
              <div class="field">
                <label for="admin-store-phone">Teléfono</label>
                <input
                  id="admin-store-phone"
                  v-model="storeReservationForm.phone"
                  type="tel"
                  placeholder="+00 123 456 789"
                />
              </div>

              <div class="field">
                <label for="admin-store-duration">Duración</label>
                <select id="admin-store-duration" v-model="storeReservationForm.duration">
                  <option value="4">4 horas</option>
                  <option value="8">8 horas</option>
                  <option value="12">12 horas</option>
                  <option value="24">24 horas</option>
                </select>
              </div>
            </div>

            <div class="field-grid two-columns">
              <div class="field">
                <label for="admin-store-date">Fecha</label>
                <input id="admin-store-date" v-model="storeReservationForm.date" :min="today" type="date" />
              </div>

              <div class="field">
                <label for="admin-store-time">Hora de retiro</label>
                <input
                  id="admin-store-time"
                  v-model="storeReservationForm.time"
                  :min="pickupTimeMin"
                  :max="pickupTimeMax"
                  type="time"
                />
              </div>
            </div>

            <div class="field">
              <label for="admin-store-pickup">Punto de recojo</label>
              <input
                id="admin-store-pickup"
                v-model="storeReservationForm.pickupPoint"
                type="text"
                readonly
              />
            </div>

            <div class="field">
              <label for="admin-store-notes">Notas adicionales</label>
              <textarea
                id="admin-store-notes"
                v-model="storeReservationForm.notes"
                placeholder="Anota alguna referencia útil para la entrega."
              />
            </div>

            <p class="helper-text">
              La reserva queda lista para atención en tienda y el pago se mantiene como físico al
              retirar la bicicleta.
            </p>

            <div
              v-if="reservationFeedback"
              class="feedback"
              :class="reservationFeedbackType === 'success' ? 'is-success' : 'is-error'"
            >
              {{ reservationFeedback }}
            </div>

            <button
              class="secondary-button"
              type="submit"
              :disabled="isCreatingReservation || !selectedReservationBike"
            >
              {{ isCreatingReservation ? 'Generando voucher...' : 'Confirmar reserva en tienda' }}
            </button>
          </form>
        </div>

        <article v-if="generatedVoucher" class="admin-store__voucher">
          <div class="admin-store__voucher-head">
            <strong>{{ generatedVoucher.code }}</strong>
            <span>Easy Bike</span>
          </div>

          <div class="admin-store__voucher-grid">
            <div>
              <small>Bicicleta</small>
              <p>{{ generatedVoucher.bikeName }}</p>
            </div>
            <div>
              <small>Fecha</small>
              <p>{{ formatLongDate(generatedVoucher.date) }}</p>
            </div>
            <div>
              <small>Hora</small>
              <p>{{ generatedVoucher.time }}</p>
            </div>
            <div>
              <small>Pago</small>
              <p>{{ generatedVoucher.paymentMethod }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="admin-accounting">
      <div class="container">
        <div class="section-header admin-accounting__header">
          <span class="eyebrow">Apartado contable</span>
          <h2 class="section-title">Resumen económico y movimiento reciente.</h2>
        </div>

        <div class="admin-accounting__summary">
          <article class="admin-accounting__card">
            <strong>{{ formatCurrency(totalRevenue) }}</strong>
            <span>Total acumulado por reservas registradas</span>
          </article>
          <article class="admin-accounting__card">
            <strong>{{ props.reservations.length }}</strong>
            <span>Reservas registradas</span>
          </article>
          <article class="admin-accounting__card">
            <strong>{{ pendingDeliveries }}</strong>
            <span>Pagos pendientes de retiro físico</span>
          </article>
        </div>

        <div class="admin-accounting__movements">
          <article v-for="reservation in recentReservations" :key="reservation.id" class="admin-movement">
            <div class="admin-movement__head">
              <div>
                <strong>{{ reservation.customerName }}</strong>
                <p>{{ reservation.bikeName }}</p>
              </div>
              <span class="status-pill" :class="getReservationStatusClass(reservation.status)">
                {{ reservation.status }}
              </span>
            </div>

            <div class="admin-movement__meta">
              <span>{{ reservation.voucherCode }}</span>
              <span>{{ reservation.pickupPoint }}</span>
              <span>{{ formatDate(reservation.createdAt) }}</span>
            </div>

            <div class="admin-movement__footer">
              <small>{{ reservation.paymentMethod }}</small>
              <strong>{{ formatCurrency(reservation.amount) }}</strong>
            </div>
          </article>
        </div>
      </div>
    </section>

    <div v-if="successModal" class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-success-title">
      <div class="admin-modal__backdrop" @click="successModal = null" />

      <article class="admin-modal__card">
        <span class="eyebrow admin-modal__eyebrow">Reserva confirmada</span>
        <h2 id="admin-success-title">La reserva presencial quedó lista.</h2>
        <p class="admin-modal__message">{{ successModal.message }}</p>

        <div class="admin-modal__grid">
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
            <strong>{{ formatLongDate(successModal.voucher.date) }}</strong>
          </div>
          <div>
            <small>Hora</small>
            <strong>{{ successModal.voucher.time }}</strong>
          </div>
          <div>
            <small>Atendido por</small>
            <strong>{{ session.name }}</strong>
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
.admin-panel {
  display: grid;
  gap: 0;
}

.admin-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 3.5rem;
  background: #fff;
}

.admin-hero__corner {
  position: absolute;
  background: #2da8c1;
  animation: admin-float 8s ease-in-out infinite;
}

.admin-hero__corner--left {
  top: 0;
  left: 0;
  width: 160px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 18%, 63% 45%, 63% 78%, 0 100%);
}

.admin-hero__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 96px;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.5s;
}

.admin-hero__grid {
  display: grid;
  gap: 2rem;
}

.admin-hero__content {
  display: grid;
  gap: 1rem;
  max-width: 56rem;
}

.admin-hero__notice {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 0 1rem 1rem;
  border-left: 4px solid var(--brand-orange);
  background: linear-gradient(90deg, rgba(242, 135, 5, 0.1), rgba(255, 255, 255, 0.14));
}

.admin-hero__notice strong,
.admin-hero__notice p {
  margin: 0;
}

.admin-hero__metrics {
  display: grid;
  gap: 1rem;
}

.admin-hero__metric {
  display: grid;
  gap: 0.35rem;
  padding: 1.05rem 1rem;
  border-top: 4px solid rgba(45, 168, 193, 0.92);
  background: rgba(247, 250, 251, 0.98);
}

.admin-hero__metric strong {
  font-size: 1.8rem;
  color: var(--brand-teal);
}

.admin-hero__metric span {
  color: var(--ink-soft);
}

.admin-management {
  padding: 2.5rem 0 3rem;
  background: #eef2f3;
}

.admin-management__grid {
  display: grid;
  gap: 1.6rem;
  align-items: start;
}

.admin-form {
  display: grid;
  gap: 1rem;
  padding: 1.4rem;
}

.admin-form__header {
  margin-bottom: 0;
}

.admin-inventory {
  display: grid;
  gap: 1rem;
}

.admin-inventory__header {
  margin-bottom: 0;
}

.admin-inventory__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  color: var(--ink-soft);
  font-weight: 700;
}

.admin-availability {
  display: grid;
  gap: 0.85rem;
}

.admin-availability__list {
  display: grid;
  gap: 0.75rem;
}

.admin-availability__item {
  display: grid;
  gap: 0.45rem;
  padding: 0.95rem 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.admin-availability__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-availability__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1rem;
  color: var(--ink-soft);
  font-weight: 700;
}

.admin-inventory__list {
  display: grid;
  gap: 1rem;
}

.admin-bike {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.94);
}

.admin-bike__media {
  min-height: 170px;
  display: grid;
  place-items: center;
  padding: 0.75rem;
  border-radius: 22px;
  background: #fff;
}

.admin-bike__image {
  width: min(100%, 230px);
  max-height: 150px;
  object-fit: contain;
}

.admin-bike__body {
  display: grid;
  gap: 0.9rem;
}

.admin-bike__topline {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-bike__topline h3,
.admin-bike__topline p,
.admin-bike__copy {
  margin: 0;
}

.admin-bike__topline p,
.admin-bike__copy {
  color: var(--ink-soft);
}

.admin-bike__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.admin-bike__action {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(19, 33, 41, 0.12);
  border-radius: 999px;
  background: #fff;
  color: var(--ink-strong);
  font-weight: 700;
  transition:
    transform 180ms ease,
    background 180ms ease,
    color 180ms ease;
}

.admin-bike__action:hover,
.admin-bike__action.is-active {
  transform: translateY(-2px);
  background: var(--brand-cyan);
  color: #fff;
}

.admin-store {
  padding: 2.5rem 0 3rem;
  background: #fff;
}

.admin-store__stack {
  display: grid;
  gap: 1.35rem;
}

.admin-store__header {
  max-width: 48rem;
}

.admin-store__grid {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}

.admin-store__catalog {
  display: grid;
  gap: 1rem;
}

.admin-store__selector {
  display: grid;
  gap: 0.7rem;
}

.admin-store__option {
  display: grid;
  justify-items: start;
  gap: 0.2rem;
  padding: 0.85rem 0 0.85rem 1rem;
  border: 0;
  border-left: 4px solid rgba(19, 33, 41, 0.12);
  background: rgba(239, 246, 248, 0.72);
  text-align: left;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;
}

.admin-store__option.is-active,
.admin-store__option:hover {
  transform: translateX(4px);
  border-left-color: var(--brand-orange);
  background: rgba(255, 255, 255, 0.98);
}

.admin-store__option span,
.admin-store__details p,
.admin-store__empty {
  color: var(--ink-soft);
}

.admin-store__bike {
  display: grid;
  gap: 1rem;
}

.admin-store__media {
  min-height: 228px;
  display: grid;
  place-items: center;
  padding: 0.85rem;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 16px 30px rgba(20, 59, 53, 0.08);
}

.admin-store__image {
  width: min(100%, 420px);
  max-height: 205px;
  object-fit: contain;
}

.admin-store__details {
  display: grid;
  gap: 1rem;
}

.admin-store__headline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-store__headline h3,
.admin-store__details p {
  margin: 0;
}

.admin-store__facts {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.admin-store__facts li {
  padding-left: 1rem;
  border-left: 3px solid rgba(45, 168, 193, 0.9);
}

.admin-store__form {
  display: grid;
  gap: 1rem;
  padding: 1.4rem;
  align-content: start;
}

.admin-store__voucher {
  display: grid;
  gap: 1.2rem;
  padding: 1.35rem 1.4rem;
  border: 2px dashed rgba(20, 59, 53, 0.24);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(223, 244, 212, 0.42), rgba(255, 255, 255, 0.98));
}

.admin-store__voucher-head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-store__voucher-head strong {
  color: var(--brand-teal);
  font-size: 1.22rem;
}

.admin-store__voucher-head span {
  color: var(--brand-cyan-deep);
  font-weight: 700;
}

.admin-store__voucher-grid {
  display: grid;
  gap: 0.9rem;
}

.admin-store__voucher-grid small,
.admin-store__voucher-grid p {
  margin: 0;
}

.admin-store__voucher-grid small {
  display: block;
  margin-bottom: 0.15rem;
  color: var(--ink-soft);
}

.admin-store__voucher-grid p {
  font-weight: 700;
}

.admin-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.admin-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(19, 33, 41, 0.5);
  backdrop-filter: blur(4px);
}

.admin-modal__card {
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

.admin-modal__eyebrow {
  background: rgba(121, 192, 92, 0.16);
  color: #2f6d1c;
}

.admin-modal__card h2,
.admin-modal__message {
  margin: 0;
}

.admin-modal__message {
  color: var(--ink-soft);
  font-size: 1.04rem;
}

.admin-modal__grid {
  display: grid;
  gap: 0.9rem;
}

.admin-modal__grid small {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--ink-soft);
}

.admin-modal__grid strong {
  color: var(--brand-teal);
}

.admin-accounting {
  padding: 2.5rem 0 4rem;
  background: #fff;
}

.admin-accounting__header {
  margin-bottom: 1.6rem;
}

.admin-accounting__summary {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.6rem;
}

.admin-accounting__card {
  display: grid;
  gap: 0.35rem;
  padding: 1.15rem 1rem;
  border-left: 4px solid rgba(20, 59, 53, 0.9);
  background: rgba(243, 247, 248, 0.96);
}

.admin-accounting__card strong {
  font-size: 1.6rem;
  color: var(--brand-teal);
}

.admin-accounting__card span {
  color: var(--ink-soft);
}

.admin-accounting__movements {
  display: grid;
  gap: 1rem;
}

.admin-movement {
  display: grid;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(247, 250, 251, 0.96);
}

.admin-movement__head,
.admin-movement__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.admin-movement__head strong,
.admin-movement__head p,
.admin-movement__footer small,
.admin-movement__footer strong {
  margin: 0;
}

.admin-movement__head p,
.admin-movement__footer small {
  color: var(--ink-soft);
}

.admin-movement__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  color: var(--brand-cyan-deep);
  font-size: 0.94rem;
  font-weight: 700;
}

@keyframes admin-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 920px) {
  .admin-hero__metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .admin-management__grid {
    grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1.08fr);
  }

  .admin-bike {
    grid-template-columns: 210px minmax(0, 1fr);
    align-items: center;
  }

  .admin-store__grid {
    grid-template-columns: minmax(320px, 0.94fr) minmax(380px, 1.06fr);
  }

  .admin-store__bike {
    grid-template-columns: minmax(190px, 230px) minmax(0, 1fr);
    align-items: center;
  }

  .admin-store__voucher-grid,
  .admin-modal__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-accounting__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .admin-hero {
    padding-top: 7.2rem;
  }

  .admin-hero__corner--left {
    width: 112px;
    height: 160px;
  }

  .admin-hero__corner--right {
    width: 105px;
    height: 72px;
  }
}
</style>

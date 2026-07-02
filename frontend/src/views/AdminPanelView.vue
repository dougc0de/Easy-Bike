<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { AuthSession, BikeItem, ReservationSummary } from '../types'

const props = defineProps<{
  session: AuthSession
  bikes: BikeItem[]
  reservations: ReservationSummary[]
}>()

const emit = defineEmits<{
  bikeCreated: [bike: BikeItem]
  availabilityUpdated: [payload: { bikeId: string; availability: BikeItem['availability'] }]
}>()

const isSavingBike = ref(false)
const bikeFeedback = ref('')
const bikeFeedbackType = ref<'success' | 'error'>('success')

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

const recentReservations = computed(() =>
  [...props.reservations]
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, 6),
)

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

    const bike: BikeItem = {
      id: `${slugify(bikeForm.name)}-${Date.now().toString().slice(-4)}`,
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

    emit('bikeCreated', bike)
    bikeFeedbackType.value = 'success'
    bikeFeedback.value = 'La bicicleta quedó agregada al catálogo mock y ya se refleja en el frontend.'

    bikeForm.name = ''
    bikeForm.category = 'Urbana'
    bikeForm.price = 'Desde $24 / 24 h'
    bikeForm.autonomy = 'Hasta 40 km'
    bikeForm.availability = 'Disponible'
    bikeForm.description = ''
    bikeForm.imageUrl = ''
  } finally {
    isSavingBike.value = false
  }
}

function updateAvailability(bikeId: string, availability: BikeItem['availability']) {
  emit('availabilityUpdated', { bikeId, availability })
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
            la entrega y seguir el movimiento contable generado por las reservas mock.
          </p>

          <div class="admin-hero__notice">
            <strong>Flujo listo para pruebas del equipo</strong>
            <p>Todo funciona en frontend con persistencia local para que el resto del equipo pueda continuar.</p>
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
            Este formulario genera un nuevo registro mock y lo deja visible también en las vistas públicas del sitio.
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

    <section class="admin-accounting">
      <div class="container">
        <div class="section-header admin-accounting__header">
          <span class="eyebrow">Apartado contable</span>
          <h2 class="section-title">Resumen económico y movimiento reciente.</h2>
        </div>

        <div class="admin-accounting__summary">
          <article class="admin-accounting__card">
            <strong>{{ formatCurrency(totalRevenue) }}</strong>
            <span>Total acumulado por reservas mock</span>
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

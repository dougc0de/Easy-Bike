<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import BikeCard from '../components/BikeCard.vue'
import ReservationForm from '../components/ReservationForm.vue'
import type { BikeItem, PageId } from '../types'

const props = defineProps<{
  bikes: BikeItem[]
  isLoggedIn: boolean
  sessionEmail?: string
  sessionName?: string
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
  requestLogin: [page: PageId, message?: string]
}>()

const activeCategory = ref('Todas')
const selectedBikeId = ref(props.bikes[0]?.id ?? '')
const reservationTarget = ref<HTMLElement | null>(null)

const categories = computed(() => ['Todas', ...new Set(props.bikes.map((bike) => bike.category))])

const filteredBikes = computed(() =>
  activeCategory.value === 'Todas'
    ? props.bikes
    : props.bikes.filter((bike) => bike.category === activeCategory.value),
)

const selectedBike = computed(
  () => props.bikes.find((bike) => bike.id === selectedBikeId.value) ?? props.bikes[0],
)

async function handleBikeReserve(bikeId: string) {
  selectedBikeId.value = bikeId
  await nextTick()
  reservationTarget.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function forwardLoginRequest(page: PageId, message?: string) {
  emit('requestLogin', page, message)
}
</script>

<template>
  <div class="bikes-view">
    <section class="bikes-hero">
      <div class="bikes-hero__corner bikes-hero__corner--left" aria-hidden="true" />
      <div class="bikes-hero__corner bikes-hero__corner--right" aria-hidden="true" />

      <div class="container">
        <div class="section-header bikes-hero__header">
          <span class="eyebrow">Bicicletas disponibles</span>
          <h1 class="section-title">Elige la bicicleta eléctrica que mejor se adapta a tu recorrido.</h1>
          <p class="section-copy">
            Aquí mantenemos tu estilo del proyecto, pero con un catálogo más funcional y listo para
            llevar al usuario desde la exploración hasta la reserva.
          </p>
        </div>

        <div class="bikes-hero__summary">
          <article class="bikes-hero__metric">
            <strong>{{ bikes.length }} modelos</strong>
            <span>organizados por categoría para facilitar la elección</span>
          </article>
          <article class="bikes-hero__metric">
            <strong>{{ isLoggedIn ? 'Sesión activa' : 'Login requerido' }}</strong>
            <span>
              {{
                isLoggedIn
                  ? `Reservando como ${sessionEmail || 'usuario activo'}`
                  : 'Inicia sesión para poder reservar tu bicicleta.'
              }}
            </span>
          </article>
          <article class="bikes-hero__metric">
            <strong>24 horas de reservacion</strong>
            <span>Disfruta de tu alquiler por 24 horas y divierte con tus amigos.</span>
          </article>
        </div>
      </div>
    </section>

    <section class="bikes-catalog">
      <div class="bikes-catalog__corner bikes-catalog__corner--left" aria-hidden="true" />
      <div class="bikes-catalog__corner bikes-catalog__corner--right" aria-hidden="true" />

      <div class="container">
        <div class="chip-list bikes-catalog__filters">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            class="chip-button"
            :class="{ 'is-active': activeCategory === category }"
            @click="activeCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div class="bikes-catalog__grid">
          <BikeCard
            v-for="bike in filteredBikes"
            :key="bike.id"
            :bike="bike"
            :selected="selectedBikeId === bike.id"
            @select="handleBikeReserve"
          />
        </div>
      </div>
    </section>

    <section class="reservation-layout">
      <div ref="reservationTarget" class="container reservation-layout__grid">
        <article v-if="selectedBike" class="reservation-focus">
          <div class="reservation-focus__intro">
            <span class="eyebrow">Modelo destacado</span>
            <h2>{{ selectedBike.name }}</h2>
            <p>{{ selectedBike.detail }}</p>
          </div>

          <div class="reservation-focus__tags">
            <span>{{ selectedBike.category }}</span>
            <span>{{ selectedBike.price }}</span>
            <span>{{ selectedBike.autonomy }}</span>
          </div>

          <div class="reservation-focus__media" :style="{ '--accent': selectedBike.accent }">
            <img
              v-if="selectedBike.imageUrl"
              :src="selectedBike.imageUrl"
              :alt="selectedBike.imageAlt"
              class="reservation-focus__image"
            />
            <div v-else class="reservation-focus__placeholder">
              <span>Espacio preparado para imagen del producto</span>
              <strong>{{ selectedBike.name }}</strong>
            </div>
          </div>

          <div class="reservation-focus__details">
            <div>
              <strong>Ideal para</strong>
              <p>{{ selectedBike.recommendedFor }}</p>
            </div>
            <div>
              <strong>Estado</strong>
              <p>{{ selectedBike.availability }}</p>
            </div>
          </div>
        </article>

        <ReservationForm
          :bikes="bikes"
          :initial-bike-id="selectedBikeId"
          :is-logged-in="isLoggedIn"
          :session-email="sessionEmail"
          :session-name="sessionName"
          @request-login="forwardLoginRequest"
        />
      </div>
    </section>

    <section class="booking-steps">
      <div class="container">
        <div class="section-header booking-steps__header">
          <span class="eyebrow">Breve proceso para reservar tu bicicleta</span>
          <h2 class="section-title">Cómo fluiría la reserva una vez integrada.</h2>
        </div>

        <div class="booking-steps__grid">
          <article class="booking-step">
            <strong>01</strong>
            <div>
              <h3>Selecciona una bicicleta</h3>
              <p>Explora modelos, disponibilidad y autonomía antes de tomar una decisión.</p>
            </div>
          </article>
          <article class="booking-step">
            <strong>02</strong>
            <div>
              <h3>Completa el formulario</h3>
              <p>Captura datos personales, fecha, hora, duración y punto de recojo.</p>
            </div>
          </article>
          <article class="booking-step">
            <strong>03</strong>
            <div>
              <h3>Ven a nuestra tienda</h3>
              <p>Ven a nuestra tienda ensenando la voucher de la reserva y usala.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.bikes-view {
  display: grid;
  gap: 0;
}

.bikes-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 3.5rem;
  background: #fff;
}

.bikes-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/hero1.jpg') center / cover no-repeat;
  opacity: 0.4;
}

.bikes-hero__corner,
.bikes-catalog__corner {
  position: absolute;
  background: #2da8c1;
  animation: bikes-float 8s ease-in-out infinite;
}

.bikes-hero__corner--left {
  top: 0;
  left: 0;
  width: 160px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 18%, 63% 45%, 63% 78%, 0 100%);
}

.bikes-hero__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 94px;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.8s;
}

.bikes-hero__header {
  position: relative;
  z-index: 2;
  max-width: 54rem;
}

.bikes-hero .eyebrow,
.bikes-hero .section-copy,
.bikes-hero__metric span,
.bikes-hero__metric strong {
  color: var(--ink-strong);
}

.bikes-hero .section-copy {
  width: fit-content;
  max-width: 58ch;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 28px rgba(19, 33, 41, 0.08);
}

.bikes-hero__summary {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 1rem;
  margin-top: 1.8rem;
}

.bikes-hero__metric {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 1rem 1rem 1rem;
  border-left: 4px solid rgba(45, 168, 193, 0.92);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 251, 0.56));
  box-shadow: 0 14px 28px rgba(19, 33, 41, 0.08);
}

.bikes-hero__metric strong {
  font-size: 1.15rem;
}

.bikes-catalog {
  position: relative;
  overflow: hidden;
  padding: 2.4rem 0 3rem;
  background: #b8b8b8;
}

.bikes-catalog__corner--left {
  top: 0;
  left: 0;
  width: 132px;
  height: 78px;
  clip-path: polygon(0 0, 86% 0, 100% 40%, 78% 100%, 0 100%);
}

.bikes-catalog__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 110px;
  clip-path: polygon(48% 0, 100% 58%, 78% 100%, 0 100%);
  animation-delay: -3s;
}

.bikes-catalog__filters {
  position: relative;
  z-index: 1;
  justify-content: center;
}

.bikes-catalog__grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.25rem;
  margin-top: 1.4rem;
}

.reservation-layout {
  padding: 2.8rem 0 3.6rem;
  background: #fff;
}

.reservation-layout__grid {
  display: grid;
  gap: 1.5rem;
  scroll-margin-top: 7.5rem;
}

.reservation-focus {
  display: grid;
  gap: 1.2rem;
  align-content: start;
}

.reservation-focus__intro {
  display: grid;
  gap: 0.8rem;
}

.reservation-focus__intro h2,
.reservation-focus__intro p {
  margin: 0;
}

.reservation-focus__intro p {
  color: var(--ink-soft);
}

.reservation-focus__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.reservation-focus__tags span {
  padding: 0.6rem 0.85rem;
  border-radius: 999px;
  background: rgba(45, 168, 193, 0.1);
  color: var(--brand-cyan-deep);
  font-weight: 700;
}

.reservation-focus__media {
  min-height: 280px;
  display: grid;
  place-items: center;
  padding: 0.9rem;
  border-radius: 30px;
  background: #fff;
  border: 1px solid rgba(19, 33, 41, 0.08);
}

.reservation-focus__image {
  width: min(100%, 420px);
  max-height: 250px;
  object-fit: contain;
}

.reservation-focus__placeholder {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
  max-width: 18rem;
  text-align: center;
  color: var(--ink-strong);
}

.reservation-focus__placeholder span {
  color: var(--ink-soft);
}

.reservation-focus__placeholder strong {
  font-size: clamp(1.6rem, 2.6vw, 2.3rem);
  line-height: 1.05;
}

.reservation-focus__details {
  display: grid;
  gap: 0.85rem;
}

.reservation-focus__details strong {
  display: block;
  margin-bottom: 0.35rem;
}

.reservation-focus__details p {
  margin: 0;
  color: var(--ink-soft);
}

.booking-steps {
  padding: 2.5rem 0 4rem;
  background: #eef2f3;
}

.booking-steps__header {
  margin-bottom: 2rem;
}

.booking-steps__grid {
  display: grid;
  gap: 1rem;
}

.booking-step {
  display: grid;
  gap: 0.9rem;
  padding: 1.15rem 1rem;
  border-left: 4px solid rgba(20, 59, 53, 0.9);
  background: rgba(255, 255, 255, 0.88);
  transition:
    transform 180ms ease,
    border-color 180ms ease;
}

.booking-step:hover {
  transform: translateX(4px);
  border-left-color: var(--brand-orange);
}

.booking-step strong {
  color: var(--brand-cyan-deep);
  font-size: 1.45rem;
}

.booking-step h3,
.booking-step p {
  margin: 0;
}

.booking-step p {
  color: var(--ink-soft);
}

@keyframes bikes-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 860px) {
  .bikes-hero__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bikes-catalog__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .reservation-layout__grid {
    grid-template-columns: minmax(280px, 0.9fr) minmax(380px, 1.1fr);
    align-items: start;
  }

  .booking-step {
    grid-template-columns: 74px 1fr;
    align-items: start;
  }
}

@media (max-width: 760px) {
  .bikes-hero {
    padding-top: 7.2rem;
  }

  .bikes-hero__corner--left {
    width: 112px;
    height: 160px;
  }

  .bikes-hero__corner--right,
  .bikes-catalog__corner--left,
  .bikes-catalog__corner--right {
    width: 105px;
    height: 72px;
  }
}
</style>

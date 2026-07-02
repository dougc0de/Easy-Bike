<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BenefitItem, BikeItem, PageId, StatItem } from '../types'

const props = defineProps<{
  benefits: BenefitItem[]
  stats: StatItem[]
  bikes: BikeItem[]
  isLoggedIn: boolean
  sessionEmail?: string
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
  requestLogin: [page: PageId, message?: string]
}>()

const activeBikeIndex = ref(0)

const activeBike = computed(() => props.bikes[activeBikeIndex.value] ?? props.bikes[0])
const carouselProgress = computed(() =>
  `${String(activeBikeIndex.value + 1).padStart(2, '0')} / ${String(props.bikes.length).padStart(2, '0')}`,
)

function goToBike(index: number) {
  if (!props.bikes.length) return

  activeBikeIndex.value = (index + props.bikes.length) % props.bikes.length
}

function showPreviousBike() {
  goToBike(activeBikeIndex.value - 1)
}

function showNextBike() {
  goToBike(activeBikeIndex.value + 1)
}

function getAvailabilityClass(availability: BikeItem['availability']) {
  if (availability === 'Disponible') return 'is-available'
  if (availability === 'Últimas unidades') return 'is-warning'
  return 'is-upcoming'
}

function reserveCurrentBike() {
  if (!activeBike.value) return

  if (!props.isLoggedIn) {
    emit(
      'requestLogin',
      'bicicletas',
      'Para reservar una bicicleta debes iniciar sesión primero. Después podrás continuar con tu reserva.',
    )
    return
  }

  emit('navigate', 'bicicletas')
}
</script>

<template>
  <div class="home-view">
    <section class="home-hero">
      <div class="home-hero__base" aria-hidden="true" />
      <div class="home-hero__image" aria-hidden="true" />

      <div class="container home-hero__inner">
        <div class="home-hero__content">
          <h1 class="home-hero__title">Reserva tu bicicleta eléctrica en minutos</h1>
          <p class="home-hero__copy">
            Muévete por la ciudad de forma rápida, cómoda y sostenible.
          </p>

          <div class="home-hero__actions">
            <button class="home-hero__button" type="button" @click="emit('navigate', 'bicicletas')">
              Bicicletas Disponibles
            </button>
            <button class="home-hero__button" type="button" @click="emit('navigate', 'login')">
              Iniciar Sesion
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="home-reasons">
      <div class="home-reasons__corner home-reasons__corner--left" aria-hidden="true" />
      <div class="home-reasons__corner home-reasons__corner--right" aria-hidden="true" />

      <div class="container home-reasons__grid">
        <div class="home-reasons__brand">
          <img class="home-reasons__brand-logo" src="/images/Logo.png" alt="Easy Bike" />
          <div class="home-reasons__brand-copy">
            <span>Movilidad urbana eléctrica con una experiencia clara, rápida y lista para reservar.</span>
          </div>
        </div>

        <div class="home-reasons__content">
          <h2>¿Por qué reservar con Easy Bike?</h2>

          <ul class="home-reasons__items">
            <li v-for="benefit in benefits" :key="benefit.eyebrow">
              <span class="home-reasons__icon" aria-hidden="true">◎</span>
              <span>{{ benefit.eyebrow }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="container home-reasons__stats">
        <article v-for="stat in stats" :key="stat.label" class="home-reasons__stat">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </article>
      </div>
    </section>

    <section class="home-bikes">
      <div class="home-bikes__corner home-bikes__corner--left" aria-hidden="true" />
      <div class="home-bikes__corner home-bikes__corner--right" aria-hidden="true" />

      <div class="home-bikes__title-band">
        <div class="container home-bikes__title-wrap">
          <h2>Bicicletas disponibles</h2>
        </div>
      </div>

      <div class="container home-bikes__intro">
        <p>Elige la bicicleta eléctrica que mejor se adapte a tu recorrido y resérvala por 24 horas.</p>
      </div>

      <div v-if="activeBike" class="container home-bikes__feature">
        <div class="home-bikes__gallery">
          <button class="home-bikes__arrow" type="button" aria-label="Anterior" @click="showPreviousBike">
            ‹
          </button>

          <transition name="bike-fade" mode="out-in">
            <div :key="activeBike.id" class="home-bikes__image-stage">
              <div class="home-bikes__image-topline">
                <span class="home-bikes__slide-count">{{ carouselProgress }}</span>
                <span class="home-bikes__image-chip">{{ activeBike.category }}</span>
              </div>

              <div class="home-bikes__image-art" :style="{ '--accent': activeBike.accent }">
                <img
                  v-if="activeBike.imageUrl"
                  :src="activeBike.imageUrl"
                  :alt="activeBike.imageAlt"
                  class="home-bikes__product-image"
                />
                <div v-else class="home-bikes__image-placeholder">
                  <span class="home-bikes__image-placeholder-label">Carrusel de bicicletas</span>
                  <strong>{{ activeBike.name }}</strong>
                  <small>Aquí puedes colocar la imagen real de este modelo cuando la tengas disponible.</small>
                </div>
              </div>
            </div>
          </transition>

          <button class="home-bikes__arrow" type="button" aria-label="Siguiente" @click="showNextBike">
            ›
          </button>
        </div>

        <transition name="bike-fade" mode="out-in">
          <div :key="activeBike.id" class="home-bikes__details">
            <div class="home-bikes__details-head">
              <span class="home-bikes__details-accent" :style="{ '--accent': activeBike.accent }">
                {{ activeBike.autonomy }}
              </span>
              <span class="status-pill" :class="getAvailabilityClass(activeBike.availability)">
                {{ activeBike.availability }}
              </span>
            </div>

            <h3>{{ activeBike.name }}</h3>
            <p class="home-bikes__detail-copy">{{ activeBike.detail }}</p>

            <ul class="home-bikes__detail-list">
              <li>{{ activeBike.price }}</li>
              <li>{{ activeBike.shortDescription }}</li>
              <li>Ideal para: {{ activeBike.recommendedFor }}</li>
            </ul>

            <div class="home-bikes__actions">
              <button class="home-bikes__reserve" type="button" @click="reserveCurrentBike">
                Reservar ahora
              </button>
              <button class="home-bikes__catalog-link" type="button" @click="emit('navigate', 'bicicletas')">
                Ver catálogo completo
              </button>
            </div>

            <p class="home-bikes__login-note">
              <template v-if="isLoggedIn">
                Sesión activa{{ sessionEmail ? ` con ${sessionEmail}` : '' }}. Ya puedes continuar con tu reserva.
              </template>
              <template v-else>
                Si intentas reservar sin cuenta, te llevaremos a Iniciar sesión para continuar.
              </template>
            </p>

            <div class="home-bikes__dots" role="tablist" aria-label="Modelos disponibles">
              <button
                v-for="(bike, index) in bikes"
                :key="bike.id"
                type="button"
                class="home-bikes__dot"
                :class="{ 'is-active': index === activeBikeIndex }"
                :aria-label="`Mostrar ${bike.name}`"
                :aria-pressed="index === activeBikeIndex"
                @click="goToBike(index)"
              />
            </div>
          </div>
        </transition>
      </div>

      <div class="home-bikes__bottom-strip" aria-hidden="true" />
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: grid;
  gap: 0;
}

.home-hero,
.home-hero__inner {
  min-height: max(540px, calc(100svh - 90px));
}

.home-hero {
  position: relative;
  overflow: hidden;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(45, 168, 193, 0.9);
  background: #252525;
}

.home-hero__base,
.home-hero__image {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.home-hero__base {
  background: #5a5a5a;
}

.home-hero__image {
  opacity: 0.5;
  background:
    linear-gradient(180deg, rgba(99, 99, 99, 0.18), rgba(66, 66, 66, 0.61)),
    url('/images/hero0.jpg');
  background-position: center;
  background-size: cover;
}

.home-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-hero__content {
  width: 100%;
  max-width: 980px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.55rem;
  padding: 4rem 0;
  text-align: center;
}

.home-hero__title {
  margin: 0;
  max-width: 14ch;
  color: #fff;
  font-size: clamp(2.55rem, 4.6vw, 4.2rem);
  font-weight: 800;
  line-height: 1.08;
}

.home-hero__copy {
  margin: 0;
  max-width: 760px;
  color: #fff;
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  font-weight: 700;
  line-height: 1.12;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.35rem;
}

.home-hero__button {
  min-width: 220px;
  padding: 0.9rem 1.35rem;
  border: 0;
  border-radius: 12px;
  background: #f28705;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
  transition:
    transform 180ms ease,
    background 180ms ease;
}

.home-hero__button:hover {
  background: #dd7a02;
  transform: translateY(-2px);
}

.home-reasons {
  position: relative;
  width: 100%;
  overflow: hidden;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 2rem;
  padding-top: 2rem;
  background: #fff;
}

.home-reasons__corner,
.home-bikes__corner {
  position: absolute;
  background: #2da8c1;
}

.home-reasons__corner--left {
  top: 0;
  left: -34px;
  width: 170px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 16%, 63% 45%, 63% 78%, 0 100%);
}

.home-reasons__corner--right {
  right: 76px;
  bottom: 0;
  width: 140px;
  height: 88px;
  clip-path: polygon(66% 0, 100% 62%, 82% 100%, 0 100%);
}

.home-reasons__grid {
  position: relative;
  z-index: 1;
  display: grid;
  align-items: center;
  gap: 2rem;
  min-height: 318px;
  padding: 2rem 0 1.2rem;
}

.home-reasons__brand {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.2rem;
  align-items: center;
  justify-items: center;
}

.home-reasons__brand-logo {
  position: relative;
  z-index: 1;
  width: min(100%, 540px);
  height: auto;
  object-fit: contain;
}

.home-reasons__brand-copy {
  display: grid;
  gap: 0.5rem;
  max-width: 30rem;
  text-align: center;
}

.home-reasons__brand-copy span {
  color: var(--ink-soft);
  font-size: 1.05rem;
}

.home-reasons__content {
  display: grid;
  gap: 1.6rem;
}

.home-reasons__content h2 {
  margin: 0;
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 0.98;
  text-align: center;
}

.home-reasons__items {
  display: grid;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.home-reasons__items li {
  display: grid;
  grid-template-columns: 52px 1fr;
  align-items: center;
  gap: 1rem;
  font-size: clamp(1.35rem, 2vw, 1.95rem);
  font-weight: 500;
  color: #111;
}

.home-reasons__icon {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: #1284f4;
  font-size: 1.8rem;
}

.home-reasons__stats {
  display: grid;
  gap: 1rem;
  padding: 0.6rem 0 1.7rem;
  border-top: 1px solid rgba(19, 33, 41, 0.08);
}

.home-reasons__stat {
  display: grid;
  gap: 0.35rem;
}

.home-reasons__stat strong {
  color: var(--brand-cyan-deep);
  font-size: 1.8rem;
}

.home-reasons__stat span {
  color: var(--ink-soft);
}

.home-bikes {
  --home-bikes-strip-height: clamp(88px, 10vw, 132px);
  position: relative;
  overflow: hidden;
  width: 100%;
  padding-bottom: 0;
  background: #fff;
}

.home-bikes::before {
  content: '';
  position: absolute;
  top: clamp(102px, 15vw, 146px);
  right: 0;
  bottom: var(--home-bikes-strip-height);
  left: 0;
  background:
    radial-gradient(circle at 18% 28%, rgba(255, 255, 255, 0.92), transparent 34%),
    radial-gradient(circle at 84% 72%, rgba(45, 168, 193, 0.14), transparent 24%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.86), rgba(239, 248, 250, 0.78));
  pointer-events: none;
}

.home-bikes__title-band {
  position: relative;
  z-index: 1;
  width: 100%;
  background: #2da8c1;
}

.home-bikes__title-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(94px, 14vw, 140px);
  padding: 1rem 0.25rem;
  text-align: center;
}

.home-bikes__title-wrap h2 {
  margin: 0;
  width: 100%;
  color: #fff;
  font-size: clamp(2.25rem, 6vw, 4.2rem);
  line-height: 0.98;
}

.home-bikes__corner--left {
  top: 0;
  left: 0;
  width: 134px;
  height: 78px;
  clip-path: polygon(0 0, 86% 0, 100% 40%, 78% 100%, 0 100%);
}

.home-bikes__corner--right {
  right: 0;
  bottom: 0;
  width: 156px;
  height: 110px;
  clip-path: polygon(48% 0, 100% 58%, 78% 100%, 0 100%);
}

.home-bikes__intro {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  padding: 1.35rem 0 1.4rem;
  text-align: center;
}

.home-bikes__intro p {
  margin: 0;
  max-width: 760px;
  color: var(--ink-strong);
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  line-height: 1.08;
}

.home-bikes__feature {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2rem;
  padding-top: 0.9rem;
  align-items: center;
}

.home-bikes__bottom-strip {
  position: relative;
  z-index: 0;
  width: 100%;
  height: var(--home-bikes-strip-height);
  background: #2da8c1;
}

.home-bikes__gallery {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
}

.home-bikes__arrow {
  width: 42px;
  height: 42px;
  border: 2px solid rgba(0, 0, 0, 0.65);
  border-radius: 50%;
  background: #fff;
  color: #111;
  font-size: 1.7rem;
  font-weight: 800;
  transition:
    transform 180ms ease,
    background 180ms ease;
}

.home-bikes__arrow:hover {
  transform: translateY(-2px);
  background: #f2f7f8;
}

.home-bikes__image-stage {
  display: grid;
  gap: 0.85rem;
}

.home-bikes__image-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.home-bikes__slide-count,
.home-bikes__image-chip {
  font-weight: 700;
}

.home-bikes__slide-count {
  color: rgba(19, 33, 41, 0.68);
}

.home-bikes__image-chip {
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: var(--ink-strong);
}

.home-bikes__image-art {
  position: relative;
  overflow: hidden;
  min-height: 290px;
  display: grid;
  place-items: center;
  padding: 0.9rem;
  border-radius: 30px;
  background: #fff;
  border: 1px solid rgba(19, 33, 41, 0.08);
  box-shadow: 0 18px 35px rgba(19, 33, 41, 0.08);
}

.home-bikes__product-image {
  width: min(100%, 380px);
  max-height: 260px;
  object-fit: contain;
}

.home-bikes__image-placeholder {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  max-width: 16rem;
  text-align: center;
}

.home-bikes__image-placeholder-label {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: color-mix(in srgb, var(--accent) 70%, #1d2730);
  font-size: 0.86rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.home-bikes__image-placeholder strong {
  font-size: clamp(1.5rem, 2.8vw, 2.2rem);
  line-height: 1.05;
  color: #1a242d;
}

.home-bikes__image-placeholder small {
  color: var(--ink-soft);
  font-size: 0.98rem;
  line-height: 1.4;
}

.home-bikes__details {
  margin-bottom: 2rem;
  display: grid;
  gap: 1rem;
  min-height: 320px;
  padding: 2rem;
  border: 1px solid rgba(19, 33, 41, 0.08);
  border-radius: 34px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.97), rgba(233, 246, 249, 0.92));
  box-shadow: 0 22px 42px rgba(19, 33, 41, 0.1);
  color: var(--ink-strong);
}

.home-bikes__details-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.home-bikes__details-accent {
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 82%, white 18%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
}

.home-bikes__details h3 {
  margin: 0;
  font-size: clamp(2rem, 3.2vw, 3rem);
  line-height: 1;
}

.home-bikes__detail-copy {
  margin: 0;
  font-size: clamp(1rem, 1.45vw, 1.28rem);
  line-height: 1.25;
  color: var(--ink-soft);
}

.home-bikes__detail-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: clamp(1rem, 1.35vw, 1.15rem);
  color: var(--ink-strong);
}

.home-bikes__detail-list li {
  padding-left: 1rem;
  border-left: 3px solid rgba(45, 168, 193, 0.42);
}

.home-bikes__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-top: 0.35rem;
}

.home-bikes__reserve,
.home-bikes__catalog-link {
  padding: 0.81rem 0.95rem;
  border-radius: 12px;
  font-weight: 700;
}

.home-bikes__reserve {
  border: 2px solid rgba(0, 0, 0, 0.45);
  background: #10d847;
  color: #fff;
}

.home-bikes__catalog-link {
  border: 1px solid rgba(19, 33, 41, 0.12);
  background: rgba(20, 59, 53, 0.06);
  color: var(--ink-strong);
}

.home-bikes__login-note {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.98rem;
}

.home-bikes__dots {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: auto;
}

.home-bikes__dot {
  width: 12px;
  height: 12px;
  border: 0;
  border-radius: 50%;
  background: rgba(19, 33, 41, 0.18);
  transition:
    transform 180ms ease,
    background 180ms ease;
}

.home-bikes__dot.is-active {
  background: var(--brand-cyan);
  transform: scale(1.15);
}

.bike-fade-enter-active,
.bike-fade-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.bike-fade-enter-from,
.bike-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (min-width: 860px) {
  .home-reasons__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .home-reasons__brand {
    justify-items: start;
  }

  .home-reasons__brand-copy {
    text-align: left;
  }

  .home-reasons__content h2 {
    text-align: center;
  }

  .home-reasons__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .home-bikes__feature {
    grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr);
  }
}

@media (max-width: 860px) {
  .home-bikes__details {
    padding: 1.5rem 1.2rem;
  }
}

@media (max-width: 760px) {
  .home-hero,
  .home-hero__inner {
    min-height: max(480px, calc(100svh - 78px));
  }

  .home-hero__content {
    gap: 1.15rem;
    padding: 3rem 0;
  }

  .home-hero__button {
    width: 100%;
    min-width: 0;
  }

  .home-reasons__corner--left {
    left: -18px;
    width: 110px;
    height: 160px;
  }

  .home-reasons__corner--right {
    right: 18px;
    width: 96px;
    height: 66px;
  }

  .home-reasons__brand-logo {
    width: min(100%, 360px);
  }

  .home-reasons__items li {
    grid-template-columns: 40px 1fr;
    font-size: 1.25rem;
  }

  .home-bikes__intro p {
    font-size: 1.08rem;
  }

  .home-bikes::before {
    top: 96px;
  }

  .home-bikes__arrow {
    width: 36px;
    height: 36px;
    font-size: 1.45rem;
  }

  .home-bikes__image-art {
    min-height: 250px;
    border-radius: 26px;
  }

  .home-bikes__product-image {
    max-height: 220px;
  }

  .home-bikes__details {
    border-radius: 28px;
  }

  .home-bikes__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

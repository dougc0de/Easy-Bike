<script setup lang="ts">
import type { AboutValue, MilestoneItem, PageId } from '../types'

defineProps<{
  values: AboutValue[]
  milestones: MilestoneItem[]
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
}>()
</script>

<template>
  <div class="about-view">
    <section class="about-hero">
      <div class="about-hero__corner about-hero__corner--left" aria-hidden="true" />
      <div class="about-hero__corner about-hero__corner--right" aria-hidden="true" />

      <div class="container about-hero__grid">
        <div class="about-hero__content">
          <span class="eyebrow">Sobre nosotros</span>
          <h1 class="section-title">Easy Bike nace para simplificar la movilidad eléctrica.</h1>
          <p class="section-copy">
            Queremos que reservar una bicicleta eléctrica se sienta claro, directo y confiable
            desde la primera pantalla hasta la confirmación final.
          </p>

          <div class="about-hero__actions">
            <button class="primary-button" type="button" @click="emit('navigate', 'bicicletas')">
              Ver bicicletas
            </button>
            <button class="ghost-button" type="button" @click="emit('navigate', 'contactanos')">
              Contáctanos
            </button>
          </div>
        </div>

        <div class="about-hero__focus">
          <strong>Visión del proyecto</strong>
          <p>
            Un sitio que mantenga una estética clara y sobria, pero que también prepare el terreno
            para reservas, para con el tiempo consolidarnos a nivel nacional como referentes en esta area haciendo uso de tecnologias a la vanguardia que nos expandan con mayor facilidad.
          </p>
          <span class="about-hero__focus-line" aria-hidden="true" />
        </div>
      </div>
    </section>

    <section class="about-values">
      <div class="container">
        <div class="section-header about-values__header">
          <span class="eyebrow">Lo que nos define</span>
          <h2 class="section-title">Una experiencia digital simple, útil y consistente.</h2>
        </div>

        <div class="about-values__grid">
          <article v-for="value in values" :key="value.title" class="about-value">
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="about-process">
      <div class="about-process__corner" aria-hidden="true" />

      <div class="container">
        <div class="section-header about-process__header">
          <span class="eyebrow">Recorrido del usuario</span>
          <h2 class="section-title">Así se sostiene la experiencia de Easy Bike.</h2>
        </div>

        <div class="about-process__timeline">
          <article v-for="item in milestones" :key="item.year" class="about-milestone">
            <strong>{{ item.year }}</strong>
            <div class="about-milestone__body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  display: grid;
  gap: 0;
}

.about-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 4rem;
  background: #fff;
}

.about-hero__corner,
.about-process__corner {
  position: absolute;
  background: #2da8c1;
  animation: about-float 8s ease-in-out infinite;
}

.about-hero__corner--left {
  top: 0;
  left: 0;
  width: 160px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 18%, 63% 45%, 63% 78%, 0 100%);
}

.about-hero__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 96px;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.6s;
}

.about-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: center;
}

.about-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1rem;
  max-width: 54rem;
}

.about-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 0.35rem;
}

.about-hero__focus {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.85rem;
  padding: 1.35rem 0 1.35rem 1.35rem;
  border-left: 4px solid var(--brand-orange);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.3));
}

.about-hero__focus strong,
.about-hero__focus p {
  margin: 0;
}

.about-hero__focus p {
  color: var(--ink-soft);
}

.about-hero__focus-line {
  width: 7rem;
  height: 4px;
  background: linear-gradient(90deg, var(--brand-cyan), rgba(45, 168, 193, 0.1));
}

.about-values {
  padding: 2.5rem 0 3.5rem;
  background: #fff;
}

.about-values__header,
.about-process__header {
  margin-bottom: 2.2rem;
}

.about-values__grid {
  display: grid;
  gap: 1.1rem;
}

.about-value {
  display: grid;
  gap: 0.65rem;
  padding: 1.4rem 1.2rem;
  border-top: 4px solid rgba(45, 168, 193, 0.92);
  background: rgba(247, 250, 251, 0.96);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.about-value:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 26px rgba(20, 59, 53, 0.08);
}

.about-value h3,
.about-value p {
  margin: 0;
}

.about-value p {
  color: var(--ink-soft);
}

.about-process {
  position: relative;
  overflow: hidden;
  padding: 2.5rem 0 4rem;
  background: #eef2f3;
}

.about-process__corner {
  right: 5%;
  bottom: 0;
  width: 160px;
  height: 110px;
  clip-path: polygon(52% 0, 100% 58%, 78% 100%, 0 100%);
}

.about-process__timeline {
  display: grid;
  gap: 1rem;
}

.about-milestone {
  display: grid;
  gap: 0.85rem;
  padding: 1.2rem 1.1rem;
  border-left: 4px solid rgba(20, 59, 53, 0.9);
  background: rgba(255, 255, 255, 0.84);
  transition:
    transform 180ms ease,
    border-color 180ms ease;
}

.about-milestone:hover {
  transform: translateX(4px);
  border-left-color: var(--brand-orange);
}

.about-milestone strong {
  color: var(--brand-cyan-deep);
  font-size: 1.45rem;
}

.about-milestone__body {
  display: grid;
  gap: 0.45rem;
}

.about-milestone__body h3,
.about-milestone__body p {
  margin: 0;
}

.about-milestone__body p {
  color: var(--ink-soft);
}

@keyframes about-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 900px) {
  .about-hero__grid {
    grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.92fr);
  }

  .about-values__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .about-milestone {
    grid-template-columns: 80px 1fr;
    align-items: start;
  }
}

@media (max-width: 760px) {
  .about-hero {
    padding-top: 7.2rem;
  }

  .about-hero__corner--left {
    width: 112px;
    height: 160px;
  }

  .about-hero__corner--right,
  .about-process__corner {
    width: 105px;
    height: 72px;
  }
}
</style>

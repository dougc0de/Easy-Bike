<script setup lang="ts">
import type { LocationConfig } from '../types'

defineProps<{
  location: LocationConfig
  apiBaseUrl: string
}>()
</script>

<template>
  <section class="map-section">
    <div class="map-section__top">
      <div class="map-section__corner map-section__corner--left" aria-hidden="true" />
      <div class="map-section__corner map-section__corner--right" aria-hidden="true" />

      <div class="container">
        <div class="map-section__title-bar">
          <span class="map-section__title-icon">⌖</span>
          <strong>{{ location.title }}</strong>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="map-section__map">
        <div
          v-if="location.imageUrl"
          class="map-section__static-image"
          :style="{ backgroundImage: `linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.12)), url('${location.imageUrl}')` }"
          aria-hidden="true"
        />

        <iframe
          v-else-if="location.embedUrl"
          :src="location.embedUrl"
          title="Mapa Easy Bike"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />

        <div v-else class="map-section__placeholder" aria-hidden="true">
          <div class="map-section__placeholder-point" />
        </div>

        <a class="map-section__cta" :href="location.externalUrl" :title="location.ctaLabel" target="_blank" rel="noreferrer">
          <span class="map-section__cta-icon">⌖</span>
          <span>Clic aca</span>
        </a>

        <div class="map-section__info">
          <strong>{{ location.address }}</strong>
          <span>{{ location.schedule }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.map-section {
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 1rem;
  background: #fff;
}

.map-section__top {
  position: relative;
  overflow: hidden;
  padding: 0.8rem 0 0;
  background: #fff;
}

.map-section__corner {
  position: absolute;
  top: 0;
  width: 150px;
  height: 88px;
  background: #2da8c1;
}

.map-section__corner--left {
  left: 0;
  clip-path: polygon(0 0, 74% 0, 100% 52%, 79% 100%, 0 100%);
}

.map-section__corner--right {
  right: 0;
  clip-path: polygon(28% 0, 100% 0, 100% 100%, 0 100%);
}

.map-section__title-bar {
  position: relative;
  margin: 0 auto 0.95rem;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.65rem 1.6rem;
  background: #dff7d8;
  color: #111;
  font-size: clamp(1.55rem, 2.4vw, 2.4rem);
  font-weight: 800;
}

.map-section__title-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: -1.05rem;
  width: 1.3rem;
  height: 1.3rem;
  background: #2da8c1;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

.map-section__title-icon {
  font-size: 1.8rem;
}

.map-section__map {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 355px;
  border: 1px solid rgba(19, 33, 41, 0.08);
  background: #f7fbfb;
  box-shadow: 0 16px 34px rgba(19, 33, 41, 0.08);
}

.map-section__map iframe {
  width: 100%;
  min-height: 355px;
  border: 0;
}

.map-section__static-image {
  min-height: 355px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.map-section__placeholder {
  position: relative;
  min-height: 355px;
  background: #f7fbfb;
}

.map-section__placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/map.jpg') center / cover no-repeat;
  opacity: 0.6;
}

.map-section__placeholder-point {
  position: absolute;
  top: 39%;
  left: 50%;
  z-index: 1;
  width: 18px;
  height: 18px;
  border-radius: 50% 50% 50% 0;
  background: #10d847;
  border: 3px solid #fff;
  box-shadow: 0 10px 24px rgba(16, 216, 71, 0.24);
  transform: translateX(-50%) rotate(-45deg);
}

.map-section__placeholder-point::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%) rotate(45deg);
}

.map-section__cta {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.45);
  background: #10d847;
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  transform: translate(-50%, -50%);
  box-shadow: 0 16px 28px rgba(7, 93, 36, 0.2);
}

.map-section__cta-icon {
  font-size: 1.15rem;
}

.map-section__info {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
  display: grid;
  gap: 0.2rem;
  max-width: min(38rem, calc(100% - 2rem));
  padding: 0.8rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #132129;
  box-shadow: 0 14px 28px rgba(19, 33, 41, 0.1);
}

.map-section__info strong,
.map-section__info span {
  margin: 0;
}

.map-section__info span {
  color: var(--ink-soft);
  font-size: 0.95rem;
}

@media (max-width: 760px) {
  .map-section__corner {
    width: 110px;
    height: 74px;
  }

  .map-section__title-bar {
    font-size: 1.3rem;
    padding-inline: 1rem;
  }

  .map-section__title-bar::after {
    right: -0.75rem;
    width: 1rem;
    height: 1rem;
  }

  .map-section__map,
  .map-section__map iframe,
  .map-section__placeholder {
    min-height: 260px;
  }

  .map-section__cta {
    padding-inline: 1.2rem;
  }

  .map-section__info {
    right: 0.6rem;
    bottom: 0.6rem;
    max-width: calc(100% - 1.2rem);
    padding: 0.7rem 0.8rem;
  }

  .map-section__info strong {
    font-size: 0.95rem;
  }

  .map-section__info span {
    font-size: 0.85rem;
  }
}
</style>

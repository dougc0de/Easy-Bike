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

        <a class="map-section__cta" :href="location.externalUrl" target="_blank" rel="noreferrer">
          <span class="map-section__cta-icon">⌖</span>
          <span>Clic aca</span>
        </a>
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
  min-height: 355px;
  background:
    radial-gradient(circle at 50% 44%, rgba(53, 213, 189, 0.88) 0 5px, transparent 6px),
    linear-gradient(134deg, rgba(255, 255, 255, 0.96), rgba(230, 248, 244, 0.88)),
    linear-gradient(90deg, rgba(53, 175, 159, 0.12) 1px, transparent 1px),
    linear-gradient(rgba(53, 175, 159, 0.12) 1px, transparent 1px),
    linear-gradient(24deg, transparent 46%, rgba(87, 178, 168, 0.28) 47%, rgba(87, 178, 168, 0.28) 49%, transparent 50%),
    linear-gradient(118deg, transparent 43%, rgba(87, 178, 168, 0.2) 44%, rgba(87, 178, 168, 0.2) 46%, transparent 47%),
    linear-gradient(76deg, transparent 64%, rgba(87, 178, 168, 0.18) 65%, rgba(87, 178, 168, 0.18) 67%, transparent 68%);
  background-size: auto, auto, 72px 72px, 72px 72px, auto, auto, auto;
}

.map-section__placeholder-point {
  position: absolute;
  top: 44%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #23d4a9;
  transform: translateX(-50%);
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
}
</style>

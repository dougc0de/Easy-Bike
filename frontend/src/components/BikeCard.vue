<script setup lang="ts">
import { computed } from 'vue'
import type { BikeItem } from '../types'

const props = defineProps<{
  bike: BikeItem
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [bikeId: string]
}>()

const statusClass = computed(() => {
  if (props.bike.availability === 'Disponible') return 'is-available'
  if (props.bike.availability === 'Últimas unidades') return 'is-warning'
  return 'is-upcoming'
})
</script>

<template>
  <article class="bike-card card-surface" :class="{ 'is-selected': selected }">
    <div class="bike-card__visual" :style="{ '--accent': bike.accent }">
      <span class="bike-card__category">{{ bike.category }}</span>
      <img v-if="bike.imageUrl" :src="bike.imageUrl" :alt="bike.imageAlt" class="bike-card__image" />
      <div v-else class="bike-card__mockup">
        <span>Imagen referencial</span>
      </div>
    </div>

    <div class="bike-card__body">
      <div class="bike-card__topline">
        <h3>{{ bike.name }}</h3>
        <span class="status-pill" :class="statusClass">{{ bike.availability }}</span>
      </div>

      <p class="bike-card__description">{{ bike.shortDescription }}</p>

      <ul class="bike-card__meta">
        <li><strong>{{ bike.price }}</strong></li>
        <li>{{ bike.autonomy }}</li>
        <li>{{ bike.recommendedFor }}</li>
      </ul>

      <button class="secondary-button" type="button" @click="emit('select', bike.id)">
        Reservar ahora
      </button>
    </div>
  </article>
</template>

<style scoped>
.bike-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.bike-card.is-selected {
  border-color: rgba(45, 168, 193, 0.4);
  box-shadow: var(--shadow-strong);
}

.bike-card__visual {
  position: relative;
  overflow: hidden;
  min-height: 180px;
  padding: 0.8rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(19, 33, 41, 0.08);
}

.bike-card__category {
  display: inline-flex;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  font-size: 0.86rem;
  font-weight: 800;
}

.bike-card__mockup {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  left: 0.8rem;
  display: grid;
  place-items: center;
  min-height: 125px;
  border-radius: 18px;
  border: 2px dashed rgba(19, 33, 41, 0.18);
  background: #fff;
  color: var(--ink-soft);
  font-weight: 700;
}

.bike-card__image {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  left: 0.8rem;
  width: calc(100% - 1.6rem);
  height: 125px;
  object-fit: contain;
}

.bike-card__body {
  display: grid;
  gap: 0.9rem;
}

.bike-card__topline {
  display: grid;
  gap: 0.7rem;
}

.bike-card__topline h3 {
  margin: 0;
  font-size: 1.35rem;
}

.bike-card__description {
  margin: 0;
  color: var(--ink-soft);
}

.bike-card__meta {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ink-soft);
}

.bike-card__meta strong {
  color: var(--ink-strong);
}
</style>

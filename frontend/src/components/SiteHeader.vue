<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NavigationItem, PageId } from '../types'

const props = defineProps<{
  items: NavigationItem[]
  currentPage: PageId
  sessionActionLabel?: string
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
  sessionAction: []
}>()

const isMenuOpen = ref(false)

watch(
  () => props.currentPage,
  () => {
    isMenuOpen.value = false
  },
)

function goTo(page: PageId) {
  emit('navigate', page)
}

function triggerSessionAction() {
  emit('sessionAction')
}
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <button class="brand-chip" type="button" @click="goTo('inicio')">
        <img class="brand-chip__logo" src="/images/Logo.png" alt="Easy Bike" />
      </button>

      <button class="menu-toggle" type="button" @click="isMenuOpen = !isMenuOpen">
        <span />
        <span />
        <span />
      </button>

      <nav class="site-nav" :class="{ 'is-open': isMenuOpen }" aria-label="Navegación principal">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="site-nav__item"
          :class="{
            'is-active': currentPage === item.id,
            'is-cta': item.variant === 'cta',
          }"
          @click="goTo(item.id)"
        >
          {{ item.label }}
        </button>

        <button
          v-if="sessionActionLabel"
          type="button"
          class="site-nav__item is-session-action"
          @click="triggerSessionAction"
        >
          {{ sessionActionLabel }}
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(16px);
  background: rgba(38, 164, 187, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}

.site-header__inner {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.brand-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.28rem 0.62rem 0.28rem 0.42rem;
  border: 0;
  border-radius: 18px;
  background: #fff;
  color: #0f3f6d;
  box-shadow: 0 14px 34px rgba(15, 63, 109, 0.15);
}

.brand-chip::after {
  content: '';
  position: absolute;
  top: 0;
  right: -0.95rem;
  width: 1.2rem;
  height: 1.2rem;
  background: #2da8c1;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  pointer-events: none;
}

.brand-chip__logo {
  display: block;
  width: auto;
  height: 3.1rem;
  object-fit: contain;
}

.menu-toggle {
  justify-self: end;
  display: inline-grid;
  gap: 0.3rem;
  padding: 0.7rem;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
}

.menu-toggle span {
  width: 1.4rem;
  height: 2px;
  background: #fff;
}

.site-nav {
  grid-column: 1 / -1;
  display: none;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.5rem;
}

.site-nav.is-open {
  display: flex;
}

.site-nav__item {
  padding: 0.95rem 1rem;
  border: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-weight: 700;
}

.site-nav__item.is-active {
  background: rgba(255, 255, 255, 0.26);
}

.site-nav__item.is-cta {
  background: #143b35;
}

.site-nav__item.is-session-action {
  background: rgba(20, 59, 53, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

@media (max-width: 979px) {
  .brand-chip {
    padding: 0.24rem 0.5rem 0.24rem 0.36rem;
    border-radius: 16px;
  }

  .brand-chip::after {
    right: -0.82rem;
    width: 1rem;
    height: 1rem;
  }

  .brand-chip__logo {
    height: 2.8rem;
  }

  .site-nav__item {
    padding: 0.72rem 0.85rem;
    border-radius: 12px;
    font-size: 0.96rem;
  }
}

@media (min-width: 980px) {
  .site-header__inner {
    grid-template-columns: auto 1fr;
  }

  .menu-toggle {
    display: none;
  }

  .site-nav {
    grid-column: auto;
    display: flex;
    flex-direction: row;
    justify-content: end;
    align-items: center;
    gap: 0;
    padding-top: 0;
  }

  .site-nav__item {
    border-radius: 0;
    padding: 0.7rem 1.2rem;
    background: transparent;
    border-right: 1px solid rgba(255, 255, 255, 0.28);
  }

  .site-nav__item:first-child {
    border-left: 1px solid rgba(255, 255, 255, 0.28);
  }

  .site-nav__item.is-active {
    color: rgba(255, 255, 255, 0.98);
    background: rgba(255, 255, 255, 0.08);
  }

  .site-nav__item.is-cta {
    margin-left: 1rem;
    border: 0;
    border-radius: 14px;
    padding-inline: 1.45rem;
    box-shadow: 0 16px 28px rgba(8, 30, 26, 0.18);
  }

  .site-nav__item.is-session-action {
    margin-left: 0.75rem;
    border: 0;
    border-radius: 14px;
    background: rgba(20, 59, 53, 0.22);
    box-shadow: 0 16px 28px rgba(8, 30, 26, 0.12);
  }
}
</style>

<script setup lang="ts">
import type { FooterColumn, FooterMeta, PageId } from '../types'

defineProps<{
  columns: FooterColumn[]
  meta: FooterMeta
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
}>()
</script>

<template>
  <footer class="site-footer">


    <div class="site-footer__line">
      <div class="container site-footer__line-content">
        <span>{{ meta.caption }}</span>
        <span>© 2026 Easy Bike</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background:
    linear-gradient(135deg, rgba(45, 168, 193, 0.08), rgba(255, 255, 255, 0.92)),
    #fff;
    
}

.site-footer__menus {
  display: grid;
  gap: 2rem;
  padding: 2.8rem 0 1.75rem;
}

.site-footer__brand {
  display: grid;
  gap: 0.9rem;
  max-width: 30rem;
}

.site-footer__badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.6rem 0.95rem;
  border-radius: 999px;
  background: rgba(22, 70, 62, 0.562);
  color: #143b3594;
  font-weight: 800;
}

.site-footer__brand p {
  margin: 0;
  color: var(--ink-soft);
}

.site-footer__columns {
  display: grid;
  gap: 1.4rem;
}

.site-footer__column h3 {
  margin: 0 0 0.85rem;
  font-size: 1rem;
}

.site-footer__column ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.7rem;
}

.site-footer__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ink-soft);
  text-align: left;
}

.site-footer__link:hover {
  color: var(--brand-cyan-deep);
}

.site-footer__line {
  border-top: 1px solid rgba(19, 33, 41, 0.08);
  background: #00200b;
  display: flex;
  text-align: center;
  
}

.site-footer__line-content {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.95rem 0;
  color: white;
  font-size: 0.9rem;
}

@media (min-width: 860px) {
  .site-footer__menus {
    grid-template-columns: minmax(240px, 0.9fr) 1.5fr;
    align-items: start;
  }

  .site-footer__columns {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .site-footer__line-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

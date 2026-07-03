<script setup lang="ts">
import { reactive, ref } from 'vue'
import { submitContactMessage } from '../services/siteApi'
import type { ContactCard, ContactPayload } from '../types'

defineProps<{
  contactCards: ContactCard[]
}>()

const form = reactive<ContactPayload>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const isSending = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

async function onSubmit() {
  if (!form.name || !form.email || !form.subject || !form.message) {
    feedbackType.value = 'error'
    feedback.value = 'Completa todos los campos para enviar tu mensaje.'
    return
  }

  isSending.value = true

  try {
    const result = await submitContactMessage({ ...form })
    feedbackType.value = 'success'
    feedback.value = `${result.message} Ticket: ${result.ticket}.`
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value =
      error instanceof Error ? error.message : 'No se pudo registrar tu mensaje en este momento.'
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div class="contact-view">
    <section class="contact-hero">
      <div class="contact-hero__corner contact-hero__corner--left" aria-hidden="true" />
      <div class="contact-hero__corner contact-hero__corner--right" aria-hidden="true" />

      <div class="container">
        <div class="section-header contact-hero__header">
          <span class="eyebrow">Contáctanos</span>
          <h1 class="section-title">Abrimos un canal claro para soporte, dudas y seguimiento.</h1>
          <p class="section-copy">
            La idea es que el usuario encuentre ayuda rápido, sepa por dónde comunicarse y deje su
            mensaje sin sentirse perdido dentro del sitio.
          </p>
        </div>

        <div class="contact-cards">
          <article v-for="card in contactCards" :key="card.title" class="contact-card">
            <h3>{{ card.title }}</h3>
            <strong>{{ card.value }}</strong>
            <p>{{ card.note }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="contact-layout">
      <div class="container contact-layout__grid">
        <article class="contact-aside">
          <span class="eyebrow">Atención útil</span>
          <h2>¿Qué puedes gestionar desde aquí?</h2>
          <ul class="contact-aside__list">
            <li>Consultas sobre disponibilidad de bicicletas.</li>
            <li>Dudas sobre puntos de recojo y horarios.</li>
            <li>Soporte inicial para reservas web.</li>
          </ul>
          <p>
            Cuando backend esté conectado, esta vista puede enviar tickets, mensajes o solicitudes
            directas sin cambiar la experiencia visual.
          </p>
        </article>

        <form class="card-surface contact-form" @submit.prevent="onSubmit">
          <div class="field-grid two-columns">
            <div class="field">
              <label for="contact-name">Nombre</label>
              <input id="contact-name" v-model="form.name" type="text" placeholder="Tu nombre" />
            </div>
            <div class="field">
              <label for="contact-email">Correo</label>
              <input id="contact-email" v-model="form.email" type="email" placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div class="field">
            <label for="contact-subject">Asunto</label>
            <input id="contact-subject" v-model="form.subject" type="text" placeholder="¿En qué te ayudamos?" />
          </div>

          <div class="field">
            <label for="contact-message">Mensaje</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              placeholder="Escribe aquí tu consulta o requerimiento."
            />
          </div>

          <div v-if="feedback" class="feedback" :class="feedbackType === 'success' ? 'is-success' : 'is-error'">
            {{ feedback }}
          </div>

          <button class="primary-button" type="submit" :disabled="isSending">
            {{ isSending ? 'Enviando...' : 'Enviar mensaje' }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-view {
  display: grid;
  gap: 0;
}

.contact-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 3.5rem;
  background: #fff;
}

.contact-hero__corner {
  position: absolute;
  background: #2da8c1;
  animation: contact-float 7.6s ease-in-out infinite;
}

.contact-hero__corner--left {
  top: 0;
  left: 0;
  width: 155px;
  height: 96px;
  clip-path: polygon(0 0, 82% 0, 100% 52%, 78% 100%, 0 100%);
}

.contact-hero__corner--right {
  top: 0;
  right: 0;
  width: 165px;
  height: 96px;
  clip-path: polygon(28% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.8s;
}

.contact-hero__header {
  position: relative;
  z-index: 1;
  max-width: 54rem;
}

.contact-cards {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
}

.contact-card {
  display: grid;
  gap: 0.45rem;
  padding: 1.2rem 1.05rem;
  border-top: 4px solid rgba(45, 168, 193, 0.92);
  background: rgba(248, 251, 252, 0.96);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 26px rgba(20, 59, 53, 0.08);
}

.contact-card h3,
.contact-card strong,
.contact-card p {
  margin: 0;
}

.contact-card strong {
  font-size: 1.1rem;
}

.contact-card p {
  color: var(--ink-soft);
}

.contact-layout {
  padding: 2.4rem 0 4rem;
  background: #eef2f3;
}

.contact-layout__grid {
  display: grid;
  gap: 1.6rem;
}

.contact-aside {
  display: grid;
  gap: 0.9rem;
  align-content: start;
  padding: 1rem 0;
}

.contact-aside h2,
.contact-aside p {
  margin: 0;
}

.contact-aside p {
  color: var(--ink-soft);
}

.contact-aside__list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contact-aside__list li {
  padding-left: 1rem;
  border-left: 3px solid rgba(45, 168, 193, 0.9);
  color: var(--ink-strong);
}

.contact-form {
  display: grid;
  gap: 1rem;
  padding: 1.4rem;
}

@keyframes contact-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@media (min-width: 860px) {
  .contact-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .contact-layout__grid {
    grid-template-columns: minmax(280px, 0.82fr) minmax(360px, 1.18fr);
  }
}

@media (max-width: 760px) {
  .contact-hero {
    padding-top: 7.2rem;
  }

  .contact-hero__corner--left,
  .contact-hero__corner--right {
    width: 112px;
    height: 72px;
  }
}
</style>

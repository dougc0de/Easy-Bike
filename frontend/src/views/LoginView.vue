<script setup lang="ts">
import { reactive, ref } from 'vue'
import { loginUser } from '../services/siteApi'
import type { AuthSession, LoginHighlight, LoginPayload, PageId } from '../types'

defineProps<{
  highlights: LoginHighlight[]
  entryMessage?: string
  isLoggedIn: boolean
  sessionEmail?: string
}>()

const emit = defineEmits<{
  navigate: [page: PageId]
  loginSuccess: [session: AuthSession]
}>()

const form = reactive<LoginPayload>({
  email: '',
  password: '',
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

async function onSubmit() {
  if (!form.email || !form.password) {
    feedbackType.value = 'error'
    feedback.value = 'Ingresa tu correo y contraseña para continuar.'
    return
  }

  isSubmitting.value = true

  try {
    const result = await loginUser({ ...form })

    feedbackType.value = 'success'
    feedback.value = `${result.welcome} ${result.note}`
    emit('loginSuccess', result.session)
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value =
      error instanceof Error ? error.message : 'No se pudo completar el inicio de sesión simulado.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <section class="login-hero">
      <div class="login-hero__corner login-hero__corner--left" aria-hidden="true" />
      <div class="login-hero__corner login-hero__corner--right" aria-hidden="true" />

      <div class="container login-hero__grid">
        <div class="login-hero__content">
          <span class="eyebrow">Iniciar sesión</span>
          <h1 class="section-title">Accede a tu espacio de reservas y gestión.</h1>
        

          <div v-if="entryMessage" class="login-hero__notice">
            <strong>Continúa tu proceso</strong>
            <p>{{ entryMessage }}</p>
          </div>

          <div v-if="isLoggedIn" class="login-hero__notice login-hero__notice--success">
            <strong>Sesión activa</strong>
            <p>Has iniciado sesión{{ sessionEmail ? ` como ${sessionEmail}` : '' }}.</p>
          </div>

        </div>

        <form class="card-surface login-form" @submit.prevent="onSubmit">
          <div class="field">
            <label for="login-email">Correo electrónico</label>
            <input id="login-email" v-model="form.email" type="email" placeholder="usuario@easybike.com" />
          </div>

          <div class="field">
            <label for="login-password">Contraseña</label>
            <div class="login-form__password">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
              />
              <button type="button" class="login-form__toggle" @click="showPassword = !showPassword">
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <div v-if="feedback" class="feedback" :class="feedbackType === 'success' ? 'is-success' : 'is-error'">
            {{ feedback }}
          </div>

          <button class="secondary-button" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Validando...' : 'Ingresar' }}
          </button>

          <div class="login-form__register">
            <span>¿No tienes cuenta?</span>
            <button type="button" class="login-form__register-link" @click="emit('navigate', 'registrarse')">
              Regístrate
            </button>
          </div>
        </form>
      </div>
    </section>


  </div>
</template>

<style scoped>
.login-view {
  display: grid;
  gap: 0;
}

.login-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 3.6rem;
  background: #fff;
}

.login-hero__corner {
  position: absolute;
  background: #2da8c1;
  animation: login-float 8s ease-in-out infinite;
}

.login-hero__corner--left {
  top: 0;
  left: 0;
  width: 160px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 18%, 63% 45%, 63% 78%, 0 100%);
}

.login-hero__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 96px;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.4s;
}

.login-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.login-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1rem;
  max-width: 52rem;
}

.login-hero__notice {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 0 1rem 1rem;
  border-left: 4px solid var(--brand-orange);
  background: linear-gradient(90deg, rgba(242, 135, 5, 0.1), rgba(255, 255, 255, 0.12));
}

.login-hero__notice--success {
  border-left-color: #2f6d1c;
  background: linear-gradient(90deg, rgba(121, 192, 92, 0.14), rgba(255, 255, 255, 0.12));
}

.login-hero__notice strong,
.login-hero__notice p {
  margin: 0;
}

.login-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.login-hero__highlights {
  display: grid;
  gap: 0.9rem;
  padding-top: 0.45rem;
}

.login-hero__highlight {
  display: grid;
  gap: 0.3rem;
  padding-left: 1rem;
  border-left: 3px solid rgba(45, 168, 193, 0.92);
}

.login-hero__highlight strong,
.login-hero__highlight p {
  margin: 0;
}

.login-hero__highlight p {
  color: var(--ink-soft);
}

.login-form {
  display: grid;
  gap: 1rem;
  padding: 1.45rem;
}

.login-form__password {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.65rem;
}

.login-form__toggle {
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink-soft);
  font-weight: 700;
}

.login-form__register {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding-top: 0.15rem;
  color: var(--ink-soft);
}

.login-form__register-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--brand-cyan-deep);
  font-weight: 800;
}

@keyframes login-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 920px) {
  .login-hero__grid {
    grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
  }
}

@media (max-width: 760px) {
  .login-hero {
    padding-top: 7.2rem;
  }

  .login-hero__corner--left {
    width: 112px;
    height: 160px;
  }

  .login-hero__corner--right {
    width: 105px;
    height: 72px;
  }

  .login-form__toggle {
    padding: 0.72rem 0.85rem;
    border-radius: 12px;
    font-size: 0.9rem;
  }
}
</style>

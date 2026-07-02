<script setup lang="ts">
import { reactive, ref } from 'vue'
import { registerUser } from '../services/siteApi'
import type { AuthSession, PageId, RegisterPayload } from '../types'

const emit = defineEmits<{
  navigate: [page: PageId]
  registerSuccess: [session: AuthSession]
}>()

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function onSubmit() {
  if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
    feedbackType.value = 'error'
    feedback.value = 'Completa todos los campos para crear tu cuenta.'
    return
  }

  if (!emailPattern.test(form.email.trim())) {
    feedbackType.value = 'error'
    feedback.value = 'Ingresa un correo válido para continuar.'
    return
  }

  if (form.password.trim() !== form.confirmPassword.trim()) {
    feedbackType.value = 'error'
    feedback.value = 'La confirmación de contraseña no coincide.'
    return
  }

  isSubmitting.value = true

  try {
    const result = await registerUser({ ...form })
    feedbackType.value = 'success'
    feedback.value = result.message
    emit('registerSuccess', result.session)
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value =
      error instanceof Error ? error.message : 'No se pudo completar el registro de prueba.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <section class="register-hero">
      <div class="register-hero__corner register-hero__corner--left" aria-hidden="true" />
      <div class="register-hero__corner register-hero__corner--right" aria-hidden="true" />

      <div class="container register-hero__grid">
        <div class="register-hero__content">
          <span class="eyebrow">Registrarse</span>
          <h1 class="section-title">Crea tu cuenta y entra directo a tu perfil de cliente.</h1>
          <p class="section-copy">
            Esta versión queda funcional desde frontend: registra al usuario en almacenamiento local,
            inicia sesión automáticamente y deja listo el flujo para conectarlo luego al backend.
          </p>

          <div class="register-hero__notice">
            <strong>Registro mock listo para pruebas</strong>
            <p>Las cuentas creadas aquí viven en el navegador hasta que el backend tome el control del flujo real.</p>
          </div>

          <div class="register-hero__actions">
            <button class="ghost-button" type="button" @click="emit('navigate', 'login')">
              Ya tengo cuenta
            </button>
          </div>
        </div>

        <form class="card-surface register-form" @submit.prevent="onSubmit">
          <div class="field">
            <label for="register-name">Nombre completo</label>
            <input id="register-name" v-model="form.name" type="text" placeholder="Tu nombre completo" />
          </div>

          <div class="field">
            <label for="register-email">Correo electrónico</label>
            <input id="register-email" v-model="form.email" type="email" placeholder="usuario@easybike.com" />
          </div>

          <div class="field">
            <label for="register-password">Contraseña</label>
            <div class="register-form__password">
              <input
                id="register-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Crea tu contraseña"
              />
              <button type="button" class="register-form__toggle" @click="showPassword = !showPassword">
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <div class="field">
            <label for="register-password-confirm">Confirmar contraseña</label>
            <div class="register-form__password">
              <input
                id="register-password-confirm"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirma tu contraseña"
              />
              <button
                type="button"
                class="register-form__toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                {{ showConfirmPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <p class="helper-text">
            Al terminar, la sesión se abrirá automáticamente y entrarás a tu perfil cliente.
          </p>

          <div v-if="feedback" class="feedback" :class="feedbackType === 'success' ? 'is-success' : 'is-error'">
            {{ feedback }}
          </div>

          <button class="secondary-button" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>

          <div class="register-form__login">
            <span>¿Ya tienes cuenta?</span>
            <button type="button" class="register-form__login-link" @click="emit('navigate', 'login')">
              Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.register-view {
  display: grid;
  gap: 0;
}

.register-hero {
  position: relative;
  overflow: hidden;
  padding: 8.5rem 0 3.6rem;
  background: #fff;
}

.register-hero__corner {
  position: absolute;
  background: #2da8c1;
  animation: register-float 8s ease-in-out infinite;
}

.register-hero__corner--left {
  top: 0;
  left: 0;
  width: 160px;
  height: 220px;
  clip-path: polygon(0 0, 78% 0, 100% 18%, 63% 45%, 63% 78%, 0 100%);
}

.register-hero__corner--right {
  right: 0;
  bottom: 0;
  width: 150px;
  height: 96px;
  clip-path: polygon(34% 0, 100% 0, 100% 100%, 0 100%);
  animation-delay: -2.2s;
}

.register-hero__grid {
  display: grid;
  gap: 2rem;
  align-items: start;
}

.register-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1rem;
  max-width: 52rem;
}

.register-hero__notice {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 0 1rem 1rem;
  border-left: 4px solid var(--brand-orange);
  background: linear-gradient(90deg, rgba(242, 135, 5, 0.1), rgba(255, 255, 255, 0.12));
}

.register-hero__notice strong,
.register-hero__notice p {
  margin: 0;
}

.register-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}

.register-form {
  display: grid;
  gap: 1rem;
  padding: 1.45rem;
}

.register-form__password {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.65rem;
}

.register-form__toggle {
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--ink-soft);
  font-weight: 700;
}

.register-form__login {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding-top: 0.15rem;
  color: var(--ink-soft);
}

.register-form__login-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--brand-cyan-deep);
  font-weight: 800;
}

@keyframes register-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (min-width: 920px) {
  .register-hero__grid {
    grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
  }
}

@media (max-width: 760px) {
  .register-hero {
    padding-top: 7.2rem;
  }

  .register-hero__corner--left {
    width: 112px;
    height: 160px;
  }

  .register-hero__corner--right {
    width: 105px;
    height: 72px;
  }
}
</style>

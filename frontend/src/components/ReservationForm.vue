<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  formatNicaraguaPhone,
  isCompleteNicaraguaPhone,
  NICARAGUA_PHONE_MAX_LENGTH,
  NICARAGUA_PHONE_PLACEHOLDER,
} from '../utils/phone'
import { submitReservation } from '../services/siteApi'
import type { BikeItem, PageId, ReservationPayload } from '../types'

const props = defineProps<{
  bikes: BikeItem[]
  initialBikeId?: string
  isLoggedIn: boolean
  sessionEmail?: string
  sessionName?: string
}>()

const emit = defineEmits<{
  requestLogin: [page: PageId, message?: string]
}>()

const today = new Date().toISOString().split('T')[0]
const pickupTimeMin = '08:00'
const pickupTimeMax = '20:00'

const form = reactive<ReservationPayload>({
  fullName: props.sessionName ?? '',
  email: props.sessionEmail ?? '',
  phone: '',
  bikeId: props.initialBikeId ?? props.bikes[0]?.id ?? '',
  date: '',
  time: '',
  duration: '24',
  pickupPoint: 'Punto Central Easy Bike',
  notes: '',
})

const isSubmitting = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

watch(
  () => props.initialBikeId,
  (value) => {
    if (value) form.bikeId = value
  },
)

watch(
  () => props.sessionName,
  (value) => {
    if (props.isLoggedIn) {
      form.fullName = value ?? ''
    }
  },
  { immediate: true },
)

watch(
  () => props.sessionEmail,
  (value) => {
    if (props.isLoggedIn) {
      form.email = value ?? ''
    }
  },
  { immediate: true },
)

const selectedBike = computed(() => props.bikes.find((bike) => bike.id === form.bikeId))

function parseTimeToMinutes(value: string) {
  const [hoursPart = '', minutesPart = ''] = value.split(':')
  const hours = Number(hoursPart)
  const minutes = Number(minutesPart)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

  return hours * 60 + minutes
}

function isPickupTimeAllowed(value: string) {
  const pickupMinutes = parseTimeToMinutes(value)
  const minMinutes = parseTimeToMinutes(pickupTimeMin)
  const maxMinutes = parseTimeToMinutes(pickupTimeMax)

  if (pickupMinutes === null || minMinutes === null || maxMinutes === null) return false

  return pickupMinutes >= minMinutes && pickupMinutes <= maxMinutes
}

function onPhoneInput(event: Event) {
  const target = event.target as HTMLInputElement
  form.phone = formatNicaraguaPhone(target.value)
}

async function onSubmit() {
  if (!props.isLoggedIn) {
    feedbackType.value = 'error'
    feedback.value = 'Para completar la reserva debes iniciar sesión primero.'
    emit(
      'requestLogin',
      'bicicletas',
      'Para completar una reserva en Easy Bike debes iniciar sesión. Después podrás retomar el proceso.',
    )
    return
  }

  if (!form.fullName || !form.email || !form.phone || !form.bikeId || !form.date || !form.time) {
    feedbackType.value = 'error'
    feedback.value = 'Completa los campos obligatorios para simular la reserva.'
    return
  }

  if (form.phone && !isCompleteNicaraguaPhone(form.phone)) {
    feedbackType.value = 'error'
    feedback.value = 'Ingresa un teléfono válido con formato 1234-5678.'
    return
  }

  if (!selectedBike.value) {
    feedbackType.value = 'error'
    feedback.value = 'Selecciona una bicicleta disponible antes de continuar.'
    return
  }

  if (!isPickupTimeAllowed(form.time)) {
    feedbackType.value = 'error'
    feedback.value = 'La hora de retiro debe estar entre 8:00 a.m. y 8:00 p.m.'
    return
  }

  isSubmitting.value = true

  try {
    const result = await submitReservation({ ...form })
    feedbackType.value = 'success'
    feedback.value = `${result.message} Código de referencia: ${result.code}.`
  } catch (error) {
    feedbackType.value = 'error'
    feedback.value =
      error instanceof Error ? error.message : 'No fue posible procesar la reserva en este momento.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="reservation-box card-surface">
    <div class="reservation-box__header">
      <span class="eyebrow">Reservación de bicicletas</span>
      <h3>Confirma tu horario y deja lista tu reserva.</h3>
      <p>
        Usa el mismo criterio del perfil cliente: seleccionas la bicicleta afuera y aquí solo
        confirmas tus datos de retiro.
      </p>
    </div>

    <div v-if="selectedBike" class="reservation-box__summary">
      <span class="reservation-box__summary-label">Modelo seleccionado</span>
      <strong>{{ selectedBike.name }}</strong>
      <small>{{ selectedBike.price }} · {{ selectedBike.autonomy }}</small>
    </div>

    <div class="reservation-box__session" :class="isLoggedIn ? 'is-active' : 'is-pending'">
      <strong>{{ isLoggedIn ? 'Sesión activa' : 'Inicia sesión para reservar' }}</strong>
      <span>
        {{
          isLoggedIn
            ? `Reservando como ${sessionEmail || 'usuario autenticado'}`
            : 'Si envías este formulario sin cuenta, te llevaremos a la pantalla de inicio de sesión.'
        }}
      </span>
    </div>

    <form class="reservation-box__form" @submit.prevent="onSubmit">
      <div class="field-grid two-columns">
        <div class="field">
          <label for="reservation-name">Nombre completo</label>
          <input id="reservation-name" v-model="form.fullName" type="text" placeholder="Tu nombre" />
        </div>

        <div class="field">
          <label for="reservation-email">Correo electrónico</label>
          <input
            id="reservation-email"
            v-model="form.email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            :readonly="isLoggedIn"
          />
        </div>
      </div>

      <div class="field-grid two-columns">
        <div class="field">
          <label for="reservation-phone">Teléfono</label>
          <input
            id="reservation-phone"
            v-model="form.phone"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            :maxlength="NICARAGUA_PHONE_MAX_LENGTH"
            :placeholder="NICARAGUA_PHONE_PLACEHOLDER"
            @input="onPhoneInput"
          />
        </div>

        <div class="field">
          <label for="reservation-duration">Duración</label>
          <select id="reservation-duration" v-model="form.duration">
            <option value="4">4 horas</option>
            <option value="8">8 horas</option>
            <option value="12">12 horas</option>
            <option value="24">24 horas</option>
          </select>
        </div>
      </div>

      <div class="field-grid two-columns">
        <div class="field">
          <label for="reservation-date">Fecha</label>
          <input id="reservation-date" v-model="form.date" :min="today" type="date" />
        </div>

        <div class="field">
          <label for="reservation-time">Hora de retiro</label>
          <input
            id="reservation-time"
            v-model="form.time"
            :min="pickupTimeMin"
            :max="pickupTimeMax"
            type="time"
          />
        </div>
      </div>

      <div class="field">
        <label for="reservation-pickup">Punto de recojo</label>
        <input id="reservation-pickup" v-model="form.pickupPoint" type="text" readonly />
      </div>

      <div class="field">
        <label for="reservation-notes">Notas adicionales</label>
        <textarea
          id="reservation-notes"
          v-model="form.notes"
          placeholder="Escribe alguna referencia o necesidad extra para tu retiro."
        />
      </div>

      <p class="helper-text">
        El voucher se genera al instante y el pago queda marcado como físico al retirar la
        bicicleta.
      </p>

      <div v-if="feedback" class="feedback" :class="feedbackType === 'success' ? 'is-success' : 'is-error'">
        {{ feedback }}
      </div>

      <div class="reservation-box__actions">
        <button class="primary-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Procesando...' : isLoggedIn ? 'Confirmar reserva' : 'Inicia sesión para reservar' }}
        </button>

        <button
          v-if="!isLoggedIn"
          class="ghost-button"
          type="button"
          @click="emit('requestLogin', 'bicicletas', 'Para reservar una bicicleta debes iniciar sesión primero.')"
        >
          Ir a Iniciar sesión
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.reservation-box {
  display: grid;
  gap: 1.3rem;
  padding: 1.4rem;
}

.reservation-box__header {
  display: grid;
  gap: 0.75rem;
}

.reservation-box__header h3 {
  margin: 0;
  font-size: 1.7rem;
}

.reservation-box__header p {
  margin: 0;
  color: var(--ink-soft);
}

.reservation-box__summary {
  display: grid;
  gap: 0.2rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(45, 168, 193, 0.14), rgba(255, 255, 255, 0.8));
}

.reservation-box__summary-label {
  color: var(--ink-soft);
  font-size: 0.9rem;
}

.reservation-box__summary strong {
  font-size: 1.15rem;
}

.reservation-box__summary small {
  color: var(--brand-cyan-deep);
  font-weight: 700;
}

.reservation-box__session {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border-radius: 18px;
}

.reservation-box__session strong {
  font-size: 1rem;
}

.reservation-box__session span {
  color: var(--ink-soft);
}

.reservation-box__session.is-active {
  background: rgba(121, 192, 92, 0.14);
}

.reservation-box__session.is-pending {
  background: rgba(242, 135, 5, 0.14);
}

.reservation-box__form {
  display: grid;
  gap: 1rem;
}

.reservation-box__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}
</style>

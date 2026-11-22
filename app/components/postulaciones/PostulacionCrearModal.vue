<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [valor: boolean]
  'creada': []
}>()

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()

const abierto = computed({
  get: () => props.modelValue,
  set: valor => emit('update:modelValue', valor),
})

const refFormulario = ref()
const guardando = ref(false)
const vacanteId = ref<number | null>(null)
const candidatoCreadoId = ref<number | null>(null)

const crearCandidatoVacio = () => ({
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  dpi: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  expectativa_salarial: '' as number | string,
})

const candidatoNuevo = reactive(crearCandidatoVacio())

const fechaMaximaNacimiento = computed(() => {
  const fecha = new Date()

  fecha.setFullYear(fecha.getFullYear() - 18)

  return fecha.toLocaleDateString('en-CA')
})

const reglaNombre = (obligatorio: boolean) => (valor: string) => {
  const texto = (valor ?? '').trim()

  if (!texto)
    return obligatorio ? 'Este campo es obligatorio.' : true

  return /^[\p{L} .'-]{2,45}$/u.test(texto) || 'Usa de 2 a 45 letras, espacios, punto, apóstrofe o guion.'
}

const reglaDpi = (valor: string) =>
  /^\d{13}$/.test((valor ?? '').replace(/\s/g, '')) || 'El DPI debe tener exactamente 13 dígitos.'

const reglaCorreo = (valor: string) => {
  const texto = (valor ?? '').trim()

  return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto) && texto.length <= 100) || 'Ingresa un correo válido.'
}

const reglaTelefono = (valor: string) =>
  /^\+?\d{8,11}$/.test((valor ?? '').replace(/[\s-]/g, '')) || 'El teléfono debe tener de 8 a 11 dígitos.'

const reglaFechaNacimiento = (valor: string) => {
  if (!valor)
    return 'Este campo es obligatorio.'

  return valor <= fechaMaximaNacimiento.value || 'El candidato debe ser mayor de 18 años.'
}

const reglaSalario = (valor: number | string) =>
  valor === '' || valor === null || Number(valor) >= 0 || 'Ingresa un monto mayor o igual a cero.'

watch(abierto, valor => {
  if (!valor)
    return

  vacanteId.value = null
  candidatoCreadoId.value = null
  Object.assign(candidatoNuevo, crearCandidatoVacio())
  refFormulario.value?.resetValidation()
})

function armarPayloadCandidato() {
  const payload: Record<string, any> = {
    primer_nombre: candidatoNuevo.primer_nombre.trim(),
    primer_apellido: candidatoNuevo.primer_apellido.trim(),
    dpi: candidatoNuevo.dpi.replace(/\s/g, ''),
    email: candidatoNuevo.email.trim().toLowerCase(),
    telefono: candidatoNuevo.telefono.replace(/[\s-]/g, ''),
    fecha_nacimiento: candidatoNuevo.fecha_nacimiento,
  }

  for (const campo of ['segundo_nombre', 'tercer_nombre', 'segundo_apellido'] as const) {
    const valor = candidatoNuevo[campo].trim()

    if (valor)
      payload[campo] = valor
  }

  if (candidatoNuevo.expectativa_salarial !== '' && candidatoNuevo.expectativa_salarial !== null)
    payload.expectativa_salarial = Number(candidatoNuevo.expectativa_salarial)

  return payload
}

async function obtenerIdDelCandidato(): Promise<number> {
  if (candidatoCreadoId.value)
    return candidatoCreadoId.value

  const respuesta = await post<SendResponseInterface<{ id: number }>>(
    'api/reclutamiento/candidatos',
    armarPayloadCandidato(),
  )

  candidatoCreadoId.value = respuesta.data.id

  return candidatoCreadoId.value
}

async function guardar() {
  if (guardando.value || !vacanteId.value)
    return

  const resultado = await refFormulario.value?.validate()

  if (!resultado?.valid)
    return

  guardando.value = true

  try {
    const candidatoId = await obtenerIdDelCandidato()

    await post<SendResponseInterface<unknown>>('api/reclutamiento/postulaciones', {
      vacante_id: vacanteId.value,
      candidato_id: candidatoId,
    })

    showToastSuccess('Postulación creada con éxito.')
    abierto.value = false
    emit('creada')
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    guardando.value = false
  }
}
</script>

<template>
  <VDialog
    v-model="abierto"
    max-width="720"
    :persistent="guardando"
  >
    <VCard title="Nueva postulación">
      <VForm
        ref="refFormulario"
        :readonly="!!candidatoCreadoId"
        @submit.prevent="guardar"
      >
        <VCardText class="d-flex flex-column gap-5">
          <div>
            <VLabel class="mb-2">
              Vacante
            </VLabel>
            <SelectorPro
              v-model:item-selected="vacanteId"
              url="api/reclutamiento/vacantes"
              item-value="id"
              item-title="nombre"
              :campos-a-filtrar="['nombre']"
            />
          </div>

          <div>
            <div class="text-overline text-medium-emphasis mb-3">
              Datos del candidato
            </div>

            <VAlert
              v-if="candidatoCreadoId"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              El candidato ya fue creado. Al reintentar solo se creará la postulación.
            </VAlert>

            <VRow>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="candidatoNuevo.primer_nombre"
                  label="Primer nombre"
                  maxlength="45"
                  :rules="[reglaNombre(true)]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="candidatoNuevo.segundo_nombre"
                  label="Segundo nombre"
                  maxlength="45"
                  :rules="[reglaNombre(false)]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="candidatoNuevo.tercer_nombre"
                  label="Tercer nombre"
                  maxlength="45"
                  :rules="[reglaNombre(false)]"
                />
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="candidatoNuevo.primer_apellido"
                  label="Primer apellido"
                  maxlength="45"
                  :rules="[reglaNombre(true)]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="candidatoNuevo.segundo_apellido"
                  label="Segundo apellido"
                  maxlength="45"
                  :rules="[reglaNombre(false)]"
                />
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="candidatoNuevo.dpi"
                  label="DPI"
                  maxlength="17"
                  :rules="[reglaDpi]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="candidatoNuevo.fecha_nacimiento"
                  label="Fecha de nacimiento"
                  type="date"
                  :max="fechaMaximaNacimiento"
                  :rules="[reglaFechaNacimiento]"
                />
              </VCol>

              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="candidatoNuevo.email"
                  label="Correo electrónico"
                  type="email"
                  maxlength="100"
                  :rules="[reglaCorreo]"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="candidatoNuevo.telefono"
                  label="Teléfono"
                  maxlength="14"
                  :rules="[reglaTelefono]"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="candidatoNuevo.expectativa_salarial"
                  label="Expectativa salarial (Q) — opcional"
                  type="number"
                  min="0"
                  step="0.01"
                  :rules="[reglaSalario]"
                />
              </VCol>
            </VRow>
          </div>
        </VCardText>

        <VDivider />

        <VCardActions class="justify-end pa-4 ga-2">
          <VBtn
            variant="text"
            :disabled="guardando"
            @click="abierto = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            type="submit"
            color="primary"
            variant="elevated"
            :loading="guardando"
            :disabled="!vacanteId"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>

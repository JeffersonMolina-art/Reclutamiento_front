<script setup lang="ts">
import type { CandidatoDetalle, OfertaEnviada, VacanteDetalle } from '@/types/reclutamiento/oferta'
import type { SendResponseInterface } from '@/types/sistema/types'

const props = defineProps<{
  urlOferta: string
  vacante?: VacanteDetalle | null
  candidato?: CandidatoDetalle | null
}>()

const emit = defineEmits<{ enviada: [oferta: OfertaEnviada] }>()

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const formateadorMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

const formatearMoneda = (valor?: number | string | null) => {
  const monto = Number(valor)

  return valor === null || valor === undefined || valor === '' || Number.isNaN(monto) ? '—' : formateadorMoneda.format(monto)
}

const enviando = ref(false)

const formulario = reactive({
  salario_ofrecido: null as number | string | null,
  fecha_inicio_propuesta: '',
  condiciones_oferta: '',
})

const fechaMinima = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' })

const formularioValido = computed(() =>
  formulario.salario_ofrecido !== null
  && formulario.salario_ofrecido !== ''
  && Number(formulario.salario_ofrecido) >= 0
  && !!formulario.fecha_inicio_propuesta
  && !!formulario.condiciones_oferta.trim(),
)

const salarioFueraDelRango = computed(() => {
  if (formulario.salario_ofrecido === null || formulario.salario_ofrecido === '')
    return false

  const ofrecido = Number(formulario.salario_ofrecido)
  const minimo = Number(props.vacante?.salario_minimo)
  const maximo = Number(props.vacante?.salario_maximo)

  if ([ofrecido, minimo, maximo].some(Number.isNaN))
    return false

  return ofrecido < minimo || ofrecido > maximo
})

async function enviarOferta() {
  if (!formularioValido.value || enviando.value)
    return

  enviando.value = true

  try {
    const respuesta = await post<SendResponseInterface<OfertaEnviada>>(props.urlOferta, {
      salario_ofrecido: Number(formulario.salario_ofrecido),
      fecha_inicio_propuesta: formulario.fecha_inicio_propuesta,
      condiciones_oferta: formulario.condiciones_oferta.trim(),
    })

    showToastSuccess('Oferta enviada con éxito.')
    emit('enviada', respuesta.data)
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VAvatar
          color="success"
          variant="tonal"
          size="36"
          rounded
        >
          <VIcon
            icon="tabler-send"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Enviar oferta</VCardTitle>
      <VCardSubtitle>
        Expectativa del candidato: {{ formatearMoneda(candidato?.expectativa_salarial) }}
        · Rango de la plaza: {{ formatearMoneda(vacante?.salario_minimo) }} – {{ formatearMoneda(vacante?.salario_maximo) }}
      </VCardSubtitle>
    </VCardItem>

    <VDivider />

    <form @submit.prevent="enviarOferta">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="formulario.salario_ofrecido"
              label="Salario ofrecido (Q)"
              type="number"
              min="0"
              step="0.01"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="formulario.fecha_inicio_propuesta"
              label="Fecha de inicio propuesta"
              type="date"
              :min="fechaMinima"
            />
          </VCol>

          <VCol
            v-if="salarioFueraDelRango"
            cols="12"
          >
            <VAlert
              type="warning"
              variant="tonal"
              density="compact"
            >
              El salario ofrecido está fuera del rango de la plaza
              ({{ formatearMoneda(vacante?.salario_minimo) }} – {{ formatearMoneda(vacante?.salario_maximo) }}).
            </VAlert>
          </VCol>

          <VCol cols="12">
            <AppTextarea
              v-model="formulario.condiciones_oferta"
              label="Condiciones de la oferta"
              rows="5"
              maxlength="5000"
              counter
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardActions class="justify-end pa-4">
        <VBtn
          type="submit"
          color="success"
          variant="elevated"
          prepend-icon="tabler-send"
          :loading="enviando"
          :disabled="!formularioValido"
        >
          Enviar oferta
        </VBtn>
      </VCardActions>
    </form>
  </VCard>
</template>

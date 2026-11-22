<script setup lang="ts">
import type { OfertaEnviada } from '@/types/reclutamiento/oferta'

defineProps<{ oferta: OfertaEnviada }>()

const formateadorMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const formateadorFecha = new Intl.DateTimeFormat('es-GT', { dateStyle: 'long', timeZone: 'UTC' })
const formateadorFechaHora = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

const formatearMoneda = (valor?: number | string | null) => {
  const monto = Number(valor)

  return valor === null || valor === undefined || valor === '' || Number.isNaN(monto) ? '—' : formateadorMoneda.format(monto)
}

const formatearFechaCalendario = (valor?: string | null) =>
  valor ? formateadorFecha.format(new Date(valor.slice(0, 10))) : '—'

const formatearFechaHora = (valor?: string | null) => valor ? formateadorFechaHora.format(new Date(valor)) : '—'

const apariencia = {
  pendiente: { texto: 'Pendiente de respuesta', color: 'warning', icono: 'tabler-clock' },
  aceptada: { texto: 'Aceptada por el candidato', color: 'success', icono: 'tabler-circle-check' },
  rechazada: { texto: 'Rechazada por el candidato', color: 'error', icono: 'tabler-circle-x' },
}

const abierto = ref(true)
</script>

<template>
  <VCard>
    <VCardItem
      class="cursor-pointer"
      @click="abierto = !abierto"
    >
      <template #prepend>
        <VAvatar
          :color="apariencia[oferta.estado_oferta].color"
          variant="tonal"
          size="36"
          rounded
        >
          <VIcon
            :icon="apariencia[oferta.estado_oferta].icono"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Oferta enviada</VCardTitle>

      <template #append>
        <VChip
          :color="apariencia[oferta.estado_oferta].color"
          variant="tonal"
          label
        >
          {{ apariencia[oferta.estado_oferta].texto }}
        </VChip>
        <VIcon
          :icon="abierto ? 'tabler-chevron-up' : 'tabler-chevron-down'"
          class="ms-2"
        />
      </template>
    </VCardItem>

    <VExpandTransition>
      <div v-show="abierto">
    <VDivider />

    <VCardText>
      <VRow>
        <VCol
          cols="12"
          sm="6"
          md="4"
        >
          <div class="text-caption text-medium-emphasis">
            Salario ofrecido
          </div>
          <div class="text-h6">
            {{ formatearMoneda(oferta.salario_ofrecido) }}
          </div>
        </VCol>
        <VCol
          cols="12"
          sm="6"
          md="4"
        >
          <div class="text-caption text-medium-emphasis">
            Fecha de inicio propuesta
          </div>
          <div class="text-h6">
            {{ formatearFechaCalendario(oferta.fecha_inicio_propuesta) }}
          </div>
        </VCol>
        <VCol
          v-if="oferta.fecha_respuesta_oferta"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="text-caption text-medium-emphasis">
            Respondida el
          </div>
          <div class="text-h6">
            {{ formatearFechaHora(oferta.fecha_respuesta_oferta) }}
          </div>
        </VCol>
        <VCol cols="12">
          <div class="text-caption text-medium-emphasis">
            Condiciones
          </div>
          <p class="text-body-1 text-pre-wrap mb-0">
            {{ oferta.condiciones_oferta }}
          </p>
        </VCol>
        <VCol
          v-if="oferta.motivo_rechazo_oferta"
          cols="12"
        >
          <div class="text-caption text-medium-emphasis">
            Motivo del rechazo
          </div>
          <p class="text-body-1 text-pre-wrap mb-0">
            {{ oferta.motivo_rechazo_oferta }}
          </p>
        </VCol>
      </VRow>
    </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

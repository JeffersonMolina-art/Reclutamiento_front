<script setup lang="ts">
import type { HistorialCandidato } from '@/types/reclutamiento/candidato'

const props = defineProps<{
  modelValue: boolean
  historial: HistorialCandidato | null
}>()

const emit = defineEmits<{ 'update:modelValue': [valor: boolean] }>()

const abierto = computed({
  get: () => props.modelValue,
  set: valor => emit('update:modelValue', valor),
})

const formateadorFechaHora = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

const formatearFechaHora = (valor?: string | null) => valor ? formateadorFechaHora.format(new Date(valor)) : '—'

const colores: Record<string, string> = {
  recibida: 'secondary',
  en_revision: 'info',
  entrevista: 'primary',
  oferta: 'warning',
  contratado: 'success',
  descartada: 'error',
}

const colorDe = (codigo: string) => colores[codigo] ?? 'secondary'
</script>

<template>
  <ModalBasico
    v-model:mostrar-modal="abierto"
    :titulo="historial ? `Historial de ${historial.candidato.nombre_completo}` : 'Historial'"
    :subtitulo="historial ? [historial.candidato.dpi, historial.candidato.correo, historial.candidato.telefono].filter(Boolean).join(' · ') : undefined"
    max-width="780"
    scrollable
  >
    <template v-if="historial">
      <div class="d-flex flex-column gap-6">
        <span
          v-if="!historial.postulaciones.length"
          class="text-body-2 text-disabled"
        >Este candidato no tiene postulaciones</span>

        <div
          v-for="postulacion in historial.postulaciones"
          :key="postulacion.id"
          class="border rounded pa-4"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-1">
            <div class="text-subtitle-1 font-weight-medium">
              {{ postulacion.vacante }}
            </div>
            <VChip
              :color="colorDe(postulacion.estado_codigo)"
              size="small"
              label
              variant="tonal"
            >
              {{ postulacion.estado }}
            </VChip>
          </div>

          <div class="text-caption text-medium-emphasis mb-3">
            Postulación #{{ postulacion.id }}
            <template v-if="postulacion.sede">· {{ postulacion.sede }}</template>
            · {{ postulacion.fecha_postulacion }}
          </div>

          <VProgressLinear
            :model-value="postulacion.porcentaje ?? 0"
            :color="colorDe(postulacion.estado_codigo)"
            height="6"
            rounded
            class="mb-4"
          />

          <VTimeline
            v-if="postulacion.seguimiento.length"
            side="end"
            density="compact"
            align="start"
          >
            <VTimelineItem
              v-for="(paso, indice) in postulacion.seguimiento"
              :key="indice"
              :dot-color="colorDe(paso.estado_codigo)"
              size="x-small"
            >
              <div class="d-flex align-center flex-wrap gap-2">
                <span class="text-body-2 font-weight-medium">{{ paso.estado }}</span>
                <span
                  v-if="paso.porcentaje != null"
                  class="text-caption text-medium-emphasis"
                >{{ paso.porcentaje }}%</span>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatearFechaHora(paso.fecha) }}<template v-if="paso.usuario"> · {{ paso.usuario }}</template>
              </div>
              <div
                v-if="paso.comentario"
                class="text-body-2 text-break mt-1"
              >
                {{ paso.comentario }}
              </div>
            </VTimelineItem>
          </VTimeline>
          <span
            v-else
            class="text-body-2 text-disabled"
          >Sin seguimiento</span>
        </div>
      </div>
    </template>
  </ModalBasico>
</template>

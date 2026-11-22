<script setup lang="ts">
import type { PostulacionDetalle } from '@/types/reclutamiento/oferta'

const props = defineProps<{ postulacion: PostulacionDetalle }>()

const formateadorFecha = new Intl.DateTimeFormat('es-GT', { dateStyle: 'long', timeZone: 'UTC' })

const formatearFechaCalendario = (valor?: string | null) =>
  valor ? formateadorFecha.format(new Date(valor.slice(0, 10))) : '—'

const candidato = computed(() => props.postulacion.candidato)

const nombreCompleto = computed(() =>
  [
    candidato.value?.primer_nombre,
    candidato.value?.segundo_nombre,
    candidato.value?.tercer_nombre,
    candidato.value?.primer_apellido,
    candidato.value?.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' '),
)

const iniciales = computed(() =>
  `${candidato.value?.primer_nombre?.[0] ?? ''}${candidato.value?.primer_apellido?.[0] ?? ''}`.toUpperCase() || 'C',
)

const nombrePuesto = computed(() =>
  props.postulacion.vacante?.puesto?.nombre || props.postulacion.vacante?.nombre || '—',
)

const descartada = computed(() => props.postulacion.estado?.codigo === 'descartada')
</script>

<template>
  <VCard class="mb-6">
    <VCardText class="d-flex flex-wrap justify-space-between align-center gap-4">
      <div class="d-flex align-center gap-4">
        <VAvatar
          color="primary"
          variant="tonal"
          size="56"
          rounded="lg"
        >
          <span class="text-h5 font-weight-bold">{{ iniciales }}</span>
        </VAvatar>

        <div>
          <div class="d-flex align-center flex-wrap gap-2 mb-1">
            <h4 class="text-h4 font-weight-semibold">
              {{ nombreCompleto || 'Candidato' }}
            </h4>
            <VChip
              v-if="postulacion.estado"
              :color="descartada ? 'error' : 'primary'"
              size="small"
              label
            >
              {{ postulacion.estado.nombre }}
            </VChip>
          </div>

          <div class="d-flex flex-wrap align-center gap-x-4 gap-y-1 text-body-2 text-medium-emphasis">
            <span class="d-flex align-center gap-1">
              <VIcon
                icon="tabler-hash"
                size="16"
              />
              Postulación #{{ postulacion.id }}
            </span>
            <span class="d-flex align-center gap-1">
              <VIcon
                icon="tabler-calendar"
                size="16"
              />
              {{ formatearFechaCalendario(postulacion.fecha_postulacion) }}
            </span>
            <span class="d-flex align-center gap-1 text-high-emphasis font-weight-medium">
              <VIcon
                icon="tabler-briefcase"
                size="16"
                color="primary"
              />
              {{ nombrePuesto }}
            </span>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

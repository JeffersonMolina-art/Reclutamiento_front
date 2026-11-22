<script setup lang="ts">
import type { ArchivoExamen } from '@/types/reclutamiento/oferta'

const props = defineProps<{ examenes?: Record<string, ArchivoExamen[]> }>()

const formateadorFechaHora = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

const formatearFechaHora = (valor?: string | null) => valor ? formateadorFechaHora.format(new Date(valor)) : '—'

const tiposDeExamen = [
  { coleccion: 'examenes_medicos', titulo: 'Examen médico', icono: 'tabler-stethoscope', color: 'error' },
  { coleccion: 'examenes_tecnicos', titulo: 'Examen técnico', icono: 'tabler-code', color: 'info' },
]

const resumen = computed(() =>
  tiposDeExamen.map(tipo => ({ ...tipo, archivos: props.examenes?.[tipo.coleccion] ?? [] })),
)

const abierto = ref(false)
</script>

<template>
  <VCard>
    <VCardItem
      class="cursor-pointer"
      @click="abierto = !abierto"
    >
      <template #prepend>
        <VAvatar
          color="warning"
          variant="tonal"
          size="36"
          rounded
        >
          <VIcon
            icon="tabler-clipboard-check"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Exámenes</VCardTitle>

      <template #append>
        <VIcon :icon="abierto ? 'tabler-chevron-up' : 'tabler-chevron-down'" />
      </template>
    </VCardItem>

    <VExpandTransition>
      <div v-show="abierto">
    <VDivider />

    <VCardText class="d-flex flex-column gap-5">
      <div
        v-for="examen in resumen"
        :key="examen.coleccion"
      >
        <div class="d-flex align-center gap-2 mb-3">
          <VIcon
            :icon="examen.icono"
            :color="examen.color"
            size="20"
          />
          <span class="text-subtitle-1 font-weight-medium">{{ examen.titulo }}</span>
        </div>

        <div
          v-if="examen.archivos.length"
          class="d-flex flex-column gap-3"
        >
          <div
            v-for="archivo in examen.archivos"
            :key="archivo.id"
            class="border rounded pa-3"
          >
            <div class="d-flex align-center justify-space-between gap-3">
              <div class="d-flex align-center gap-3 min-w-0">
                <div
                  v-if="archivo.evaluacion"
                  class="text-h4 font-weight-bold"
                  :class="`text-${examen.color}`"
                >
                  {{ archivo.evaluacion.puntuacion }}
                </div>
                <div class="min-w-0">
                  <div class="text-body-2 font-weight-medium text-truncate">
                    {{ archivo.nombre }}
                  </div>
                  <div
                    v-if="archivo.evaluacion"
                    class="text-caption text-medium-emphasis"
                  >
                    {{ archivo.evaluacion.modalidad }}
                    · {{ formatearFechaHora(archivo.evaluacion.fecha_evaluacion) }}
                  </div>
                </div>
              </div>

              <VBtn
                :href="archivo.original_url"
                target="_blank"
                rel="noopener"
                icon="tabler-external-link"
                variant="text"
                size="small"
                aria-label="Abrir archivo"
              />
            </div>

            <div
              v-if="archivo.evaluacion?.comentarios"
              class="text-body-2 text-medium-emphasis text-break mt-2"
            >
              {{ archivo.evaluacion.comentarios }}
            </div>
          </div>
        </div>

        <span
          v-else
          class="text-body-2 text-disabled"
        >Sin examen registrado</span>
      </div>
    </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

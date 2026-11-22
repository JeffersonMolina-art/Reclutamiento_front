<script setup lang="ts">
import type { EntrevistaRealizada } from '@/types/reclutamiento/oferta'

defineProps<{ entrevistas: EntrevistaRealizada[] }>()

const formateadorFechaHora = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

const formatearFechaHora = (valor?: string | null) => valor ? formateadorFechaHora.format(new Date(valor)) : '—'
const capitalizar = (texto?: string | null) => texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '—'

const aparienciaResultado: Record<string, { texto: string; color: string }> = {
  aprobado: { texto: 'Aprobada', color: 'success' },
  no_aprobado: { texto: 'No aprobada', color: 'error' },
  pendiente: { texto: 'Pendiente', color: 'warning' },
}

const nombresTipo: Record<string, string> = {
  tecnica: 'Técnica',
  recursos_humanos: 'Recursos humanos',
}

const resultadoDe = (resultado: string) =>
  aparienciaResultado[resultado] ?? { texto: capitalizar(resultado), color: 'secondary' }

const esEnlaceWeb = (texto?: string | null) => !!texto && /^https?:\/\//i.test(texto)

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
          color="success"
          variant="tonal"
          size="36"
          rounded
        >
          <VIcon
            icon="tabler-messages"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Entrevistas</VCardTitle>

      <template #append>
        <VIcon :icon="abierto ? 'tabler-chevron-up' : 'tabler-chevron-down'" />
      </template>
    </VCardItem>

    <VExpandTransition>
      <div v-show="abierto">
    <VDivider />

    <VCardText>
      <div
        v-if="entrevistas.length"
        class="d-flex flex-column gap-3"
      >
        <div
          v-for="entrevista in entrevistas"
          :key="entrevista.id"
          class="border rounded pa-4"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-3">
            <div class="text-subtitle-1 font-weight-medium">
              Entrevista {{ (nombresTipo[entrevista.tipo_entrevista] ?? capitalizar(entrevista.tipo_entrevista)).toLowerCase() }}
            </div>
            <VChip
              :color="resultadoDe(entrevista.resultado).color"
              size="small"
              label
              variant="tonal"
            >
              {{ resultadoDe(entrevista.resultado).texto }}
            </VChip>
          </div>

          <VRow dense>
            <VCol
              cols="12"
              sm="6"
            >
              <div class="text-caption text-medium-emphasis">
                Fecha y hora
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ formatearFechaHora(entrevista.fecha_hora_programada) }}
              </div>
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <div class="text-caption text-medium-emphasis">
                Entrevistador
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ entrevista.entrevistador?.nombre_completo || '—' }}
              </div>
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <div class="text-caption text-medium-emphasis">
                Modalidad
              </div>
              <div class="text-body-2 font-weight-medium">
                {{ capitalizar(entrevista.modalidad) }}
              </div>
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <div class="text-caption text-medium-emphasis">
                Lugar o enlace
              </div>
              <div class="text-body-2 font-weight-medium text-break">
                <a
                  v-if="esEnlaceWeb(entrevista.ubicacion_o_enlace)"
                  :href="entrevista.ubicacion_o_enlace!"
                  target="_blank"
                  rel="noopener"
                >Abrir enlace</a>
                <template v-else>
                  {{ entrevista.ubicacion_o_enlace || '—' }}
                </template>
              </div>
            </VCol>
          </VRow>

          <div
            v-if="entrevista.observaciones"
            class="mt-3"
          >
            <div class="text-caption text-medium-emphasis">
              Observaciones
            </div>
            <div class="text-body-2 text-break">
              {{ entrevista.observaciones }}
            </div>
          </div>
        </div>
      </div>

      <span
        v-else
        class="text-body-2 text-disabled"
      >No hay entrevistas registradas</span>
    </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

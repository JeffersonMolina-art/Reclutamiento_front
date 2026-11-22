<script setup lang="ts">
import type { CandidatoListado } from '@/types/reclutamiento/candidato'

const props = defineProps<{
  modelValue: boolean
  candidato: CandidatoListado | null
}>()

const emit = defineEmits<{ 'update:modelValue': [valor: boolean] }>()

const abierto = computed({
  get: () => props.modelValue,
  set: valor => emit('update:modelValue', valor),
})

const formateadorMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

const expectativa = computed(() => {
  const monto = Number(props.candidato?.expectativa_salarial)

  return props.candidato?.expectativa_salarial == null || Number.isNaN(monto) ? '—' : formateadorMoneda.format(monto)
})

const datos = computed(() => [
  { icono: 'tabler-id', etiqueta: 'DPI', valor: props.candidato?.dpi || '—' },
  { icono: 'tabler-mail', etiqueta: 'Correo', valor: props.candidato?.correo || '—' },
  { icono: 'tabler-phone', etiqueta: 'Teléfono', valor: props.candidato?.telefono || '—' },
  { icono: 'tabler-cash', etiqueta: 'Expectativa salarial', valor: expectativa.value },
])
</script>

<template>
  <ModalBasico
    v-model:mostrar-modal="abierto"
    :titulo="candidato?.nombre_completo ?? 'Candidato'"
    :subtitulo="candidato ? `Candidato #${candidato.id}` : undefined"
    max-width="640"
    scrollable
  >
    <template v-if="candidato">
      <div class="d-flex flex-column gap-5">
        <VRow dense>
          <VCol
            v-for="dato in datos"
            :key="dato.etiqueta"
            cols="12"
            sm="6"
          >
            <div class="d-flex align-center gap-3">
              <VIcon
                :icon="dato.icono"
                size="20"
                class="text-medium-emphasis"
              />
              <div class="min-w-0">
                <div class="text-caption text-medium-emphasis">
                  {{ dato.etiqueta }}
                </div>
                <div class="text-body-1 font-weight-medium text-break">
                  {{ dato.valor }}
                </div>
              </div>
            </div>
          </VCol>
        </VRow>

        <div>
          <div class="text-overline text-medium-emphasis mb-2">
            Postulaciones ({{ candidato.total_postulaciones }})
          </div>

          <div
            v-if="candidato.postulaciones?.length"
            class="d-flex flex-column gap-2"
          >
            <div
              v-for="postulacion in candidato.postulaciones"
              :key="postulacion.id"
              class="border rounded pa-3 d-flex align-center justify-space-between flex-wrap gap-2"
            >
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ postulacion.vacante }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  Postulación #{{ postulacion.id }} · {{ postulacion.fecha_postulacion }}
                </div>
              </div>
              <VChip
                size="small"
                label
                variant="tonal"
                color="primary"
              >
                {{ postulacion.estado }}
              </VChip>
            </div>
          </div>
          <span
            v-else
            class="text-body-2 text-disabled"
          >Sin postulaciones</span>
        </div>
      </div>
    </template>
  </ModalBasico>
</template>

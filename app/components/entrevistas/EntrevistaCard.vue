<script setup lang="ts">
import { can } from '@layouts/plugins/casl'
import type { SendResponseInterface } from '@/types/sistema/types'
import type { Entrevista } from '@/types/entrevistas/types'
import { REGEX_MEET, RESULTADOS_ENTREVISTA, TIPOS_ENTREVISTA } from '@/constantes/Entrevistas'

const props = defineProps<{ entrevista: Entrevista }>()
const emit = defineEmits<{ (e: 'actualizada', value: Entrevista): void }>()

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()

const guardandoResultado = ref(false)

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

const esVirtual = computed(() => props.entrevista.modalidad === 'virtual')
const tieneMeet = computed(() => esVirtual.value && REGEX_MEET.test(props.entrevista.ubicacion_o_enlace))
const etiquetaTipo = computed(() =>
  TIPOS_ENTREVISTA.find(t => t.value === props.entrevista.tipo_entrevista)?.title ?? props.entrevista.tipo_entrevista,
)
const resultado = computed(() => RESULTADOS_ENTREVISTA[props.entrevista.resultado ?? 'pendiente'] ?? RESULTADOS_ENTREVISTA.pendiente)

const fechaFormateada = computed(() => {
  const fecha = new Date(props.entrevista.fecha_hora_programada)

  return Number.isNaN(fecha.getTime()) ? props.entrevista.fecha_hora_programada : formatoFecha.format(fecha)
})

async function registrarResultado(valor: 'aprobado' | 'no_aprobado') {
  guardandoResultado.value = true

  try {
    const respuesta = await post<SendResponseInterface<Entrevista>>(
      `api/reclutamiento/entrevistas/${props.entrevista.id}/resultado`,
      { resultado: valor, observaciones: props.entrevista.observaciones || null },
    )

    emit('actualizada', { ...respuesta.data, resultado: respuesta.data?.resultado ?? valor })
    showToastSuccess('Resultado registrado con éxito.')
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    guardandoResultado.value = false
  }
}
</script>

<template>
  <VCard
    variant="outlined"
    height="100%"
  >
    <VCardText class="pa-5">
      <div class="d-flex flex-wrap align-start justify-space-between ga-3 mb-4">
        <div class="d-flex align-center ga-3">
          <VAvatar
            :color="esVirtual ? 'info' : 'primary'"
            variant="tonal"
            rounded="lg"
            size="40"
          >
            <VIcon
              :icon="esVirtual ? 'tabler-video' : 'tabler-map-pin'"
              size="20"
            />
          </VAvatar>

          <div>
            <h3 class="text-subtitle-1 font-weight-bold">
              {{ etiquetaTipo }}
            </h3>
            <span class="text-body-2 text-medium-emphasis">
              {{ esVirtual ? 'Virtual' : 'Presencial' }}
              <template v-if="entrevista.entrevistador?.nombre_completo">
                · {{ entrevista.entrevistador.nombre_completo }}
              </template>
            </span>
          </div>
        </div>

        <div class="d-flex ga-2">
          <VChip
            size="small"
            :color="resultado.color"
            variant="tonal"
            label
          >
            {{ resultado.texto }}
          </VChip>
          <VChip
            v-if="entrevista.estado"
            size="small"
            color="primary"
            variant="tonal"
            label
          >
            {{ entrevista.estado.nombre }}
          </VChip>
        </div>
      </div>

      <div class="d-flex align-center ga-2 text-body-2 mb-2">
        <VIcon
          icon="tabler-clock"
          size="18"
          class="text-medium-emphasis"
        />
        {{ fechaFormateada }}
      </div>

      <div
        v-if="!esVirtual"
        class="d-flex align-center ga-2 text-body-2"
      >
        <VIcon
          icon="tabler-map-pin"
          size="18"
          class="text-medium-emphasis"
        />
        {{ entrevista.ubicacion_o_enlace }}
      </div>

      <div
        v-if="entrevista.observaciones"
        class="entrevista-card__observaciones mt-4 pa-3"
      >
        <div class="text-caption font-weight-medium mb-1">
          Observaciones
        </div>
        <p class="text-body-2 text-medium-emphasis text-pre-wrap mb-0">
          {{ entrevista.observaciones }}
        </p>
      </div>

      <VBtn
        v-if="tieneMeet"
        :href="entrevista.ubicacion_o_enlace"
        target="_blank"
        rel="noopener noreferrer"
        variant="tonal"
        color="primary"
        size="small"
        append-icon="tabler-external-link"
        class="mt-4"
      >
        Unirse a Meet
      </VBtn>

      <div
        v-if="can('editar postulaciones', 'Postulacion') && entrevista.resultado === 'pendiente'"
        class="d-flex ga-2 mt-4"
      >
        <VBtn
          color="success"
          size="small"
          variant="tonal"
          prepend-icon="tabler-check"
          :loading="guardandoResultado"
          @click="registrarResultado('aprobado')"
        >
          Aprobado
        </VBtn>
        <VBtn
          color="error"
          size="small"
          variant="tonal"
          prepend-icon="tabler-x"
          :disabled="guardandoResultado"
          @click="registrarResultado('no_aprobado')"
        >
          No aprobado
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.entrevista-card__observaciones {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 8px;
  overflow-wrap: anywhere;
}
</style>

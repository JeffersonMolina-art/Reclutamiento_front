<script setup lang="ts">
const props = defineProps<{ codigoEstado?: string | null }>()

const etapas = [
  { codigo: 'recibida', titulo: 'Recibida', icono: 'tabler-inbox' },
  { codigo: 'en_revision', titulo: 'En revisión', icono: 'tabler-file-search' },
  { codigo: 'entrevista', titulo: 'Entrevista', icono: 'tabler-messages' },
  { codigo: 'oferta', titulo: 'Oferta', icono: 'tabler-file-text' },
  { codigo: 'contratado', titulo: 'Contratado', icono: 'tabler-user-check' },
]

const descartada = computed(() => props.codigoEstado === 'descartada')
const contratado = computed(() => props.codigoEstado === 'contratado')
const indiceActual = computed(() => etapas.findIndex(etapa => etapa.codigo === props.codigoEstado))

const etapasConSituacion = computed(() =>
  etapas.map((etapa, indice) => {
    let situacion: 'completada' | 'actual' | 'pendiente' = 'pendiente'

    if (!descartada.value && (contratado.value || indice < indiceActual.value))
      situacion = 'completada'
    else if (!descartada.value && indice === indiceActual.value)
      situacion = 'actual'

    const colores = { completada: 'success', actual: 'primary', pendiente: 'secondary' }

    return { ...etapa, situacion, color: colores[situacion] }
  }),
)
</script>

<template>
  <div
    class="w-100"
    role="list"
    aria-label="Avance de tu proceso"
  >
    <VAlert
      v-if="descartada"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      Tu postulación no continuó en el proceso.
    </VAlert>

    <div class="d-flex flex-wrap align-start">
      <template
        v-for="(etapa, indice) in etapasConSituacion"
        :key="etapa.codigo"
      >
        <div
          class="avance-proceso__etapa d-flex flex-column align-center text-center"
          role="listitem"
          :aria-current="etapa.situacion === 'actual' ? 'step' : undefined"
        >
          <VAvatar
            :color="etapa.color"
            :variant="etapa.situacion === 'pendiente' ? 'tonal' : 'flat'"
            size="40"
          >
            <VIcon
              :icon="etapa.situacion === 'completada' ? 'tabler-check' : etapa.icono"
              size="20"
            />
          </VAvatar>
          <span
            class="avance-proceso__titulo mt-2"
            :class="{ 'avance-proceso__titulo--actual': etapa.situacion === 'actual' }"
          >
            {{ etapa.titulo }}
          </span>
        </div>

        <div
          v-if="indice < etapasConSituacion.length - 1"
          class="avance-proceso__conector d-none d-sm-block"
          :class="{ 'avance-proceso__conector--completado': etapa.situacion === 'completada' }"
          aria-hidden="true"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.avance-proceso__etapa {
  min-inline-size: 80px;
}

.avance-proceso__conector {
  flex-grow: 1;
  margin-block-start: 18px;
  margin-inline: 8px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  block-size: 3px;
  border-radius: 3px;
}

.avance-proceso__conector--completado {
  background: rgb(var(--v-theme-success));
}

.avance-proceso__titulo {
  color: rgba(var(--v-theme-on-surface), 0.85);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.avance-proceso__titulo--actual {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 700;
}
</style>

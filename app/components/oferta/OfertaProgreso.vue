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

    if (contratado.value || indice < indiceActual.value)
      situacion = 'completada'
    else if (indice === indiceActual.value)
      situacion = 'actual'

    const colores = { completada: 'success', actual: 'primary', pendiente: 'secondary' }

    return { ...etapa, situacion, color: colores[situacion] }
  }),
)

const abierto = ref(false)
</script>

<template>
  <VCard class="mb-6">
    <VCardItem
      class="cursor-pointer"
      @click="abierto = !abierto"
    >
      <template #prepend>
        <VAvatar
          color="primary"
          variant="tonal"
          size="36"
          rounded
        >
          <VIcon
            icon="tabler-route"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Avance del proceso</VCardTitle>

      <template #append>
        <VIcon :icon="abierto ? 'tabler-chevron-up' : 'tabler-chevron-down'" />
      </template>
    </VCardItem>

    <VExpandTransition>
      <div v-show="abierto">
    <VDivider />

    <VCardText>
      <VAlert
        v-if="descartada"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Esta postulación fue descartada.
      </VAlert>

      <div class="d-flex flex-wrap align-start">
        <template
          v-for="(etapa, indice) in etapasConSituacion"
          :key="etapa.codigo"
        >
          <div
            class="d-flex flex-column align-center text-center"
            style="min-inline-size: 96px;"
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
              class="text-caption mt-1"
              :class="etapa.situacion === 'pendiente' ? 'text-disabled' : 'font-weight-medium'"
            >
              {{ etapa.titulo }}
            </span>
          </div>

          <div
            v-if="indice < etapasConSituacion.length - 1"
            class="flex-grow-1 d-none d-sm-block rounded mx-2"
            style="block-size: 3px; margin-block-start: 18px;"
            :class="etapa.situacion === 'completada' ? 'bg-success' : 'bg-secondary'"
            :style="etapa.situacion === 'completada' ? undefined : 'opacity: 0.3;'"
          />
        </template>
      </div>
    </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

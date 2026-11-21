<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'

interface BitacoraItem {
  id: number | string
  titulo: string
  seccion?: string | null
  comentario?: string | null
  fecha_crea?: string | null
  icono?: string | null
  color?: string | null
}

interface BitacoraPaginada {
  data: BitacoraItem[]
  total: number
}

const props = withDefaults(defineProps<{
  modelId: string | number
  modelType: string
  pageSize?: number
  bitacoraGestor?: boolean
  endpoint?: string
}>(), {
  pageSize: 5,
  bitacoraGestor: false,
  endpoint: 'api/bitacoras',
})

const { get } = useClienteRequest()

const items = ref<BitacoraItem[]>([])
const pagina = ref(1)
const totalPaginas = ref(1)
const loading = ref(false)
const errorCarga = ref(false)
let ultimaConsulta = 0

async function getItems() {
  const consulta = ++ultimaConsulta
  loading.value = true
  errorCarga.value = false

  try {
    const respuesta = await get<SendResponseInterface<BitacoraPaginada | BitacoraItem[]>>(
      props.endpoint,
      {
        params: {
          'page[number]': pagina.value,
          'page[size]': props.pageSize,
          'filter[model_type]': props.modelType,
          'filter[model_id]': props.modelId,
          ...(props.bitacoraGestor ? { 'filter[bitacoraGestor]': 1 } : {}),
        },
      },
    )

    if (consulta !== ultimaConsulta)
      return

    const resultado = respuesta.data

    if (Array.isArray(resultado)) {
      items.value = resultado
      totalPaginas.value = 1
      return
    }

    items.value = resultado.data
    totalPaginas.value = Math.max(1, Math.ceil(resultado.total / props.pageSize))
  }
  catch (error: any) {
    if (consulta !== ultimaConsulta)
      return

    errorCarga.value = true
    manejaError(error)
  }
  finally {
    if (consulta === ultimaConsulta)
      loading.value = false
  }
}

watch(pagina, getItems)

watch(
  [
    () => props.modelId,
    () => props.modelType,
    () => props.endpoint,
    () => props.pageSize,
    () => props.bitacoraGestor,
  ],
  () => {
    items.value = []
    totalPaginas.value = 1

    if (pagina.value === 1)
      void getItems()
    else
      pagina.value = 1
  },
)

onMounted(getItems)
</script>

<template>
  <div class="bitacora" :aria-busy="loading">
    <VProgressLinear
      v-if="loading"
      indeterminate
      rounded
      color="primary"
      class="mb-3"
    />

    <VAlert
      v-if="errorCarga"
      type="error"
      variant="tonal"
      class="mb-3"
    >
      No se pudo cargar la bitácora.

      <template #append>
        <VBtn
          type="button"
          size="small"
          variant="text"
          @click="getItems"
        >
          Reintentar
        </VBtn>
      </template>
    </VAlert>

    <ul v-if="items.length" class="bitacora-lista">
      <li v-for="item in items" :key="item.id" class="bitacora-evento">
        <VAvatar
          v-if="item.icono"
          :color="item.color || 'secondary'"
          variant="tonal"
          rounded="lg"
          size="40"
          aria-hidden="true"
        >
          <VIcon :icon="item.icono" size="21" />
        </VAvatar>

        <div class="bitacora-contenido">
          <div class="bitacora-cabecera">
            <h3 class="text-body-1 font-weight-bold mb-0">
              {{ item.titulo }}
            </h3>

            <span v-if="item.fecha_crea" class="text-caption text-medium-emphasis">
              {{ item.fecha_crea }}
            </span>
          </div>

          <VChip
            v-if="item.seccion"
            :color="item.color || undefined"
            size="x-small"
            variant="tonal"
            class="mt-1"
          >
            {{ item.seccion }}
          </VChip>

          <p v-if="item.comentario" class="bitacora-comentario text-body-2 mt-2 mb-0">
            {{ item.comentario }}
          </p>
        </div>
      </li>
    </ul>

    <p
      v-else-if="!loading && !errorCarga"
      class="bitacora-vacia text-body-2 text-medium-emphasis mb-0"
    >
      Sin registros en la bitácora.
    </p>

    <VPagination
      v-if="totalPaginas > 1"
      v-model="pagina"
      :length="totalPaginas"
      :total-visible="5"
      :disabled="loading"
      density="comfortable"
      class="mt-4"
    />
  </div>
</template>

<style scoped>
.bitacora-lista {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bitacora-evento {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
}

.bitacora-evento > .v-avatar {
  flex-shrink: 0;
}

.bitacora-contenido {
  flex: 1;
  min-inline-size: 0;
}

.bitacora-cabecera {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  overflow-wrap: anywhere;
}

.bitacora-comentario {
  color: rgba(var(--v-theme-on-surface), 0.78);
  line-height: 1.6;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.bitacora-vacia {
  padding: 1.5rem 1rem;
  border: thin dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  text-align: center;
}
</style>

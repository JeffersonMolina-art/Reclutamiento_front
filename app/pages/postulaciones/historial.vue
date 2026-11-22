<script setup lang="ts">
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import PostulacionHistorialModal from '@/components/postulaciones/PostulacionHistorialModal.vue'
import { MODEL_TYPE_POSTULACION } from '@/constantes/ModelTypes'
import type { PostulacionHistorialItem } from '@/types/reclutamiento/candidato'

definePageMeta({
  middleware: 'permissions',
  action: 'historial postulaciones',
  subject: 'Postulacion',
})

const dataTable = ref<InstanceType<typeof DataTable> | null>(null)
const buscar = ref('')
const vacanteId = ref<number | null>(null)
const estadoId = ref<number | null>(null)
const fechaDesde = ref('')
const fechaHasta = ref('')

const mostrarModal = ref(false)
const seleccionada = ref<PostulacionHistorialItem | null>(null)

const filtroOculto = (key: string, valor: string | number | null) => ({
  title: key,
  key,
  visible: false,
  exportable: false,
  sortable: false,
  OpcionesFiltro: { campo: key, operador: '=' as const, valor: valor || null },
})

const columnas = computed(() => [
  { title: 'ID', key: 'id' },
  { title: 'Candidato', key: 'candidato', sortable: false },
  { title: 'Correo', key: 'correo', sortable: false },
  { title: 'Vacante', key: 'vacante', sortable: false },
  { title: 'Estado', key: 'estado_id' },
  { title: 'Fecha de postulación', key: 'fecha_postulacion' },
  filtroOculto('buscar', buscar.value.trim()),
  filtroOculto('vacante_id', vacanteId.value),
  filtroOculto('filtro_estado_id', estadoId.value),
  filtroOculto('fecha_desde', fechaDesde.value),
  filtroOculto('fecha_hasta', fechaHasta.value),
  { title: 'Acciones', key: 'acciones', sortable: false, exportable: false },
])

function filtrar() {
  return dataTable.value?.getItems()
}

async function limpiarFiltros() {
  buscar.value = ''
  vacanteId.value = null
  estadoId.value = null
  fechaDesde.value = ''
  fechaHasta.value = ''
  await nextTick()

  return filtrar()
}

function ver(item: PostulacionHistorialItem) {
  seleccionada.value = item
  mostrarModal.value = true
}
</script>

<template>
  <div class="mb-4">
    <h1>Historial de postulaciones</h1>
  </div>

  <VCard class="mb-4">
    <VCardText>
      <VRow align="end">
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="buscar"
            label="Buscar"
            @keyup.enter="filtrar"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <VLabel>Vacante</VLabel>
          <SelectorPro
            v-model:item-selected="vacanteId"
            url="api/reclutamiento/vacantes"
            item-value="id"
            item-title="nombre"
            :campos-a-filtrar="['nombre']"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <VLabel>Estado</VLabel>
          <SelectorPro
            v-model:item-selected="estadoId"
            url="api/catalogo/postulacion_estado"
            item-value="id"
            item-title="nombre"
            :campos-a-filtrar="['nombre']"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="fechaDesde"
            type="date"
            label="Desde"
          />
        </VCol>
        <VCol
          cols="12"
          md="3"
        >
          <AppTextField
            v-model="fechaHasta"
            type="date"
            label="Hasta"
          />
        </VCol>
        <VCol
          cols="12"
          md="auto"
          class="d-flex ga-2"
        >
          <VBtn
            color="secondary"
            @click="limpiarFiltros"
          >
            <VIcon
              icon="tabler-clear-all"
              start
              size="22"
            />
            Limpiar
          </VBtn>
          <VBtn
            color="primary"
            @click="filtrar"
          >
            <VIcon
              icon="tabler-filter"
              start
              size="22"
            />
            Filtrar
          </VBtn>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <DataTableComponent
    ref="dataTable"
    :columnas="columnas"
    :model="MODEL_TYPE_POSTULACION"
    endpoint="api/reclutamiento/postulaciones/historial"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['reiniciar']"
  >
    <template #item.estado_id="{ item }">
      <VChip
        size="small"
        variant="tonal"
        color="primary"
      >
        {{ item.estado }}
      </VChip>
    </template>

    <template #item.acciones="{ item }">
      <VBtn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-eye"
        @click="ver(item)"
      >
        Ver
      </VBtn>
    </template>
  </DataTableComponent>

  <PostulacionHistorialModal
    v-model="mostrarModal"
    :postulacion="seleccionada"
  />
</template>

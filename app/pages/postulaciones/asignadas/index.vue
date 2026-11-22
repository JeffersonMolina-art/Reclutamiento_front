<script setup lang="ts">
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import { MODEL_TYPE_POSTULACION } from '@/constantes/ModelTypes'
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

interface Candidato {
  primer_nombre?: string | null
  segundo_nombre?: string | null
  tercer_nombre?: string | null
  primer_apellido?: string | null
  segundo_apellido?: string | null
}

const dataTable = ref<InstanceType<typeof DataTable> | null>(null)
const mostrarCrear = ref(false)
const estadoId = ref<number | null>(null)
const ESTADO_RECIBIDA_ID = 1
const ESTADO_EN_REVISION_ID = 2
const ESTADO_ENTREVISTA_ID = 3
const ESTADO_OFERTA_ID = 4
const columnas = computed(() => [
  { title: 'ID', key: 'id' },
  { title: 'Vacante', key: 'vacante', sortable: false },
  { title: 'Candidato', key: 'candidato', sortable: false },
  { title: 'Estado', key: 'estado', sortable: false },
  { title: 'Fecha de postulación', key: 'fecha_postulacion' },
  {
    title: 'estado_id',
    key: 'estado_id',
    visible: false,
    exportable: false,
    sortable: false,
    OpcionesFiltro: {
      campo: 'estado_id',
      operador: '=' as const,
      valor: estadoId.value,
    },
  },
  {
    title: 'Acciones',
    key: 'acciones',
    sortable: false,
    exportable: false,
  },
])
function filtrar() {
  return dataTable.value?.getItems()
}

async function limpiarFiltros() {
  estadoId.value = null
  await nextTick()
  return filtrar()
}
function estadoRecibida(postulacion: { estado_id?: number | null }) {
  return postulacion.estado_id === ESTADO_RECIBIDA_ID
    && can('recibida postulaciones', 'Postulacion')
}
function estadoEntrevista(postulacion: { estado_id?: number | null }) {
  return postulacion.estado_id === ESTADO_ENTREVISTA_ID
    && can('entrevista postulaciones', 'Postulacion')
}
function estadoOferta(postulacion: { estado_id?: number | null }) {
  return postulacion.estado_id === ESTADO_OFERTA_ID
    && can('oferta postulaciones', 'Postulacion')
}
function estadoEnRevision(postulacion: { estado_id?: number | null }) {
  return postulacion.estado_id === ESTADO_EN_REVISION_ID
    && can('revision postulaciones', 'Postulacion')
}
</script>

<template>
  <div class="mb-4 d-flex align-center justify-space-between flex-wrap ga-2">
    <h1>Postulaciones</h1>

    <VBtn
      v-if="can('crear postulaciones', 'Postulacion')"
      color="primary"
      prepend-icon="tabler-plus"
      @click="mostrarCrear = true"
    >
      Nueva postulación
    </VBtn>
  </div>

  <PostulacionCrearModal
    v-model="mostrarCrear"
    @creada="filtrar"
  />

  <VCard class="mb-4">
    <VCardText>
      <VRow align="end">
        <VCol cols="12" md="4">
          <VLabel>Estado</VLabel>
          <SelectorPro
            v-model:item-selected="estadoId"
            url="api/catalogo/postulacion_estado"
            placeholder="Escribe para buscar..."
            item-value="id"
            item-title="nombre"
            :campos-a-filtrar="['nombre']"
          />
        </VCol>

        <VCol cols="12" md="auto" class="d-flex ga-2">
          <VBtn color="secondary" @click="limpiarFiltros">
            <VIcon icon="tabler-clear-all" start size="22" />
            Limpiar
          </VBtn>
          <VBtn color="primary" @click="filtrar">
            <VIcon icon="tabler-filter" start size="22" />
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
    endpoint="api/reclutamiento/postulaciones"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['reiniciar']"
  >
    <template #item.vacante="{ item }">
      {{ item.vacante?.nombre ?? `#${item.vacante_id}` }}
    </template>

    <template #item.candidato="{ item }">
      {{ item.candidato?.nombre_completo || `#${item.candidato_id}` }}
    </template>

    <template #item.estado="{ item }">
      <VChip size="small" variant="tonal" color="primary">
        {{ item.estado?.nombre ?? 'Sin estado' }}
      </VChip>
    </template>

    <template #item.fecha_postulacion="{ item }">
      <span class="text-no-wrap">
        {{ item.fecha_postulacion?.slice(0, 10) ?? '—' }}
      </span>
    </template>
    <template #item.acciones="{ item }">
      <VBtn
        v-if="estadoRecibida(item)"
        :to="`/postulaciones/asignadas/${item.id}/seguimiento`"
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-clipboard-list"
      >
        Seguimiento
      </VBtn>
      <VBtn
        v-if="estadoEnRevision(item)"
        :to="`/postulaciones/asignadas/${item.id}/revision`"
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-clipboard-list"
      >
        Seguimiento
      </VBtn>
      <VBtn
        v-if="estadoEntrevista(item)"
        :to="`/postulaciones/asignadas/${item.id}/entrevista`"
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-calendar-event"
      >
        Gestionar entrevista
      </VBtn>
      <VBtn
        v-if="estadoOferta(item)"
        :to="`/postulaciones/asignadas/${item.id}/oferta`"
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-file-dollar"
      >
        Gestionar oferta
      </VBtn>
    </template>
  </DataTableComponent>
</template>

<script setup lang="ts">
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import { MODEL_TYPE_POSTULACION } from '@/constantes/ModelTypes'

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
const estadoId = ref<number | null>(null)

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

function nombreCandidato(candidato?: Candidato | null) {
  if (!candidato)
    return ''

  return [
    candidato.primer_nombre,
    candidato.segundo_nombre,
    candidato.tercer_nombre,
    candidato.primer_apellido,
    candidato.segundo_apellido,
  ].filter(Boolean).join(' ')
}

function filtrar() {
  return dataTable.value?.getItems()
}

async function limpiarFiltros() {
  estadoId.value = null
  await nextTick()
  return filtrar()
}
</script>

<template>
  <div class="mb-4">
    <h1>Postulaciones</h1>
  </div>

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
      {{ nombreCandidato(item.candidato) || `#${item.candidato_id}` }}
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
        v-if="item.estado?.nombre?.trim().toLowerCase() === 'recibida'"
        :to="`/postulaciones/asignadas/${item.id}/seguimiento`"
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-clipboard-list"
      >
        Seguimiento
      </VBtn>
    </template>
  </DataTableComponent>
</template>

<script setup lang="ts">
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import { MODEL_TYPE_CANDIDATO } from '@/constantes/ModelTypes'

const dataTable = ref<InstanceType<typeof DataTable> | null>(null)
const buscar = ref('')
const vacanteId = ref<number | null>(null)

const columnas = computed(() => [
  { title: 'ID', key: 'id' },
  { title: 'Candidato', key: 'nombre_completo', sortable: false },
  { title: 'DPI', key: 'dpi', sortable: false },
  { title: 'Correo', key: 'correo', sortable: false },
  { title: 'Teléfono', key: 'telefono', sortable: false },
  { title: 'Postulaciones', key: 'total_postulaciones', sortable: false },
  {
    title: 'buscar',
    key: 'buscar',
    visible: false,
    exportable: false,
    sortable: false,
    OpcionesFiltro: { campo: 'buscar', operador: '=' as const, valor: buscar.value.trim() || null },
  },
  {
    title: 'vacante_id',
    key: 'vacante_id',
    visible: false,
    exportable: false,
    sortable: false,
    OpcionesFiltro: { campo: 'vacante_id', operador: '=' as const, valor: vacanteId.value },
  },
  { title: 'Acciones', key: 'acciones', sortable: false, exportable: false },
])

function filtrar() {
  return dataTable.value?.getItems()
}

async function limpiarFiltros() {
  buscar.value = ''
  vacanteId.value = null
  await nextTick()

  return filtrar()
}
</script>

<template>
  <VCard class="mb-4">
    <VCardText>
      <VRow align="end">
        <VCol
          cols="12"
          md="5"
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
    :model="MODEL_TYPE_CANDIDATO"
    endpoint="api/reclutamiento/candidatos"
    :cantidad-por-pagina="10"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['reiniciar']"
  >
    <template #item.expectativa_salarial="{ item }">
      {{ item.expectativa_salarial ?? '—' }}
    </template>

    <template #item.acciones="{ item }">
      <slot
        name="acciones"
        :item="item"
      />
    </template>
  </DataTableComponent>
</template>

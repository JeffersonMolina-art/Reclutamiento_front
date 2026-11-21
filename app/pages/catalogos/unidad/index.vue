<script setup lang="ts">
import { can } from '@layouts/plugins/casl'
import type { SendSuccessInterface } from '@/types/sistema/types'
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import {MODEL_TYPE_UNIDAD} from "@/constantes/ModelTypes";

definePageMeta({
  middleware: 'permissions',
  action: 'listar unidades',
  subject: 'Unidad',
})

const { deleted } = useClienteRequest()
const { showToastSuccess, preguntaEliminar } = useToast()
const { paginaEspera } = useCargandoPagina()

const headers = [
  {
    title: 'Codigo',
    key: 'codigo',
  },
  {
    title: 'Nombre',
    key: 'nombre',
  },
  {
    title: 'Emails',
    key: 'emails',
  },
  {
    title: 'Estado',
    key: 'estado',
  },
  {
    title: 'Regiones',
    key: 'nombre_regiones',
  },
  {
    title: 'Gerencia',
    key: 'nombre_gerencia',
  },
  {
    title: 'Jefe',
    key: 'jefe_id',
  },
  {
    title: 'Auxiliar',
    key: 'auxiliar_id',
  },
  {
    title: 'Municipio',
    key: 'nombre_municipio',
  },
  {
    title: 'Departamento',
    key: 'nombre_departamento',
  },
  {
    title: 'Acciones',
    key: 'Acciones',
    sortable: false,
    exportable: false,
  }
]

const dataTable = ref<InstanceType<typeof DataTable> | null>(null)

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea Eliminar Unidad?')
  if (!confirm)
    return
  paginaEspera.value = true
  try {
    const respuesta = await deleted<SendSuccessInterface>(`api/catalogo/unidades/${id}`)

    showToastSuccess(respuesta.message)
    if (dataTable.value)
      dataTable.value?.getItems()
  }
  catch (error: any) {
    manejaError(error)
  }
  finally {
    paginaEspera.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1 v-text="'Listado de unidades'"/>
    <VBtn
      v-if="can('crear unidades', 'Unidad')"
      class="ml-auto"
      to="/catalogos/unidad/create"
    >
      <VIcon class="tabler-plus mr-1"/>
      Nuev@ Unidad
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTable"
    :columnas="headers"
    :model="MODEL_TYPE_UNIDAD"
    endpoint="api/catalogo/unidades"
    :cantidad-por-pagina="5"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver unidades', 'Unidad')"
        icon="tabler-eye"
        variant="tonal"
        v-tooltip="'Ver'"
        color="info"
        :to="`/catalogos/unidad/show/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('editar unidades', 'Unidad')"
        icon="tabler-edit"
        variant="tonal"
        v-tooltip="'Editar'"
        color="warning"
        :to="`/catalogos/unidad/edit/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('eliminar unidades', 'Unidad')"
        icon="tabler-trash"
        variant="tonal"
        v-tooltip="'Eliminar'"
        color="error"
        @click="deleteItem(item.id)"
      />
    </template>
  </DataTableComponent>
</template>
<style scoped lang="scss">

</style>

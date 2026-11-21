<script setup lang="ts">
import { can } from '@layouts/plugins/casl'
import type { SendSuccessInterface } from '@/types/sistema/types'
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import {MODEL_TYPE_BANDEJA} from "@/constantes/ModelTypes";

definePageMeta({
  middleware: 'permissions',
  action: 'listar bandejas',
  subject: 'Bandeja',
})

const { deleted } = useClienteRequest()
const { showToastSuccess, preguntaEliminar } = useToast()
const { paginaEspera } = useCargandoPagina()

const headers = [
  {
    title: 'Nombre',
    key: 'nombre',
  },
  {
    title: 'Codigo',
    key: 'codigo',
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
  const confirm = await preguntaEliminar('¿Desea Eliminar Bandeja?')
  if (!confirm)
    return
  paginaEspera.value = true
  try {
    const respuesta = await deleted<SendSuccessInterface>(`api/catalogo/bandeja/${id}`)

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
    <h1 v-text="'Listado de bandejas'"/>
    <VBtn
      v-if="can('crear bandejas', 'Bandeja')"
      class="ml-auto"
      to="/catalogos/bandeja/create"
    >
      <VIcon class="tabler-plus mr-1"/>
      Nuev@ Bandeja
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTable"
    :columnas="headers"
    :model="MODEL_TYPE_BANDEJA"
    endpoint="api/catalogo/bandeja"
    :cantidad-por-pagina="5"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver bandejas', 'Bandeja')"
        icon="tabler-eye"
        variant="tonal"
        v-tooltip="'Ver'"
        color="info"
        :to="`/catalogos/bandeja/show/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('editar bandejas', 'Bandeja')"
        icon="tabler-edit"
        variant="tonal"
        v-tooltip="'Editar'"
        color="warning"
        :to="`/catalogos/bandeja/edit/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('eliminar bandejas', 'Bandeja')"
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

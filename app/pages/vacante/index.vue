<script setup lang="ts">
import { can } from '@layouts/plugins/casl'
import type { SendSuccessInterface } from '@/types/sistema/types'
import type DataTable from '@/components/form-elements/DataTableComponent.vue'
import {MODEL_TYPE_VACANTE} from "@/constantes/ModelTypes";

definePageMeta({
  middleware: 'permissions',
  action: 'listar vacantes',
  subject: 'Vacante',
})

const { deleted } = useClienteRequest()
const { showToastSuccess, preguntaEliminar } = useToast()
const { paginaEspera } = useCargandoPagina()

const headers = [
  { title: 'Vacante', key: 'nombre' },
  { title: 'Estado', key: 'estado_nombre', sortable: false },
  { title: 'Sede', key: 'sede_nombre', sortable: false },
  { title: 'Encargado', key: 'encargado_nombre', sortable: false },
  { title: 'Plazas', key: 'cantidad_plazas', align: 'center' as const },
  { title: 'Rango salarial', key: 'rango_salarial', sortable: false },
  { title: 'Publicación', key: 'fecha_publicacion' },
  { title: 'Acciones', key: 'Acciones', exportable: false, sortable: false },
]

const modalidades: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
}

const coloresEstado: Record<string, string> = {
  borrador: 'secondary',
  publicada: 'success',
  pausada: 'warning',
  cerrada: 'error',
}

const dataTable = ref<InstanceType<typeof DataTable> | null>(null)

const deleteItem = async (id: number) => {
  const confirm = await preguntaEliminar('¿Desea Eliminar Vacante?')
  if (!confirm)
    return
  paginaEspera.value = true
  try {
    const respuesta = await deleted<SendSuccessInterface>(`api/reclutamiento/vacantes/${id}`)

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
    <h1 v-text="'Listado de vacantes'"/>
    <VBtn
      v-if="can('crear vacantes', 'Vacante')"
      class="ml-auto"
      to="/vacante/create"
    >
      <VIcon class="tabler-plus mr-1"/>
      Nuev@ Vacante
    </VBtn>
  </div>

  <DataTableComponent
    ref="dataTable"
    :columnas="headers"
    :model="MODEL_TYPE_VACANTE"
    endpoint="api/reclutamiento/vacantes"
    :cantidad-por-pagina="5"
    :cantidad-por-pagina-opciones="[10, 20, 30]"
    :botones="['xlsx', 'pdf', 'csv', 'reiniciar']"
  >
    <template #item.nombre="{ item }">
      <div class="py-2">
        <div class="font-weight-semibold">
          {{ item.nombre }}
        </div>
        <div
          v-if="item.puesto_nombre && item.puesto_nombre !== item.nombre"
          class="text-caption text-medium-emphasis"
        >
          {{ item.puesto_nombre }}
        </div>
      </div>
    </template>

    <template #item.estado_nombre="{ item }">
      <VChip
        size="small"
        variant="tonal"
        :color="coloresEstado[item.estado?.codigo ?? ''] ?? 'secondary'"
      >
        {{ item.estado_nombre ?? 'Sin estado' }}
      </VChip>
    </template>

    <template #item.sede_nombre="{ item }">
      <div class="py-2">
        <div>{{ item.sede_nombre ?? 'Sin sede' }}</div>
        <div
          v-if="item.modalidad_trabajo"
          class="text-caption text-medium-emphasis"
        >
          {{ modalidades[item.modalidad_trabajo] ?? item.modalidad_trabajo }}
        </div>
      </div>
    </template>

    <template #item.encargado_nombre="{ item }">
      {{ item.encargado_nombre || 'Sin asignar' }}
    </template>

    <template #item.rango_salarial="{ item }">
      <span class="text-no-wrap">{{ item.rango_salarial ?? '—' }}</span>
    </template>

    <template #item.fecha_publicacion="{ item }">
  <span class="text-no-wrap">
    {{ item.fecha_publicacion?.slice(0, 10) ?? '—' }}
  </span>
    </template>
    <template #item.Acciones="{ item }">
      <VBtn
        v-if="can('ver vacantes', 'Vacante')"
        icon="tabler-eye"
        variant="tonal"
        v-tooltip="'Ver'"
        color="info"
        :to="`/vacante/show/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('editar vacantes', 'Vacante')"
        icon="tabler-edit"
        variant="tonal"
        v-tooltip="'Editar'"
        color="warning"
        :to="`/vacante/edit/${item.id}`"
        class="mr-1"
      />
      <VBtn
        v-if="can('eliminar vacantes', 'Vacante')"
        icon="tabler-trash"
        variant="tonal"
        v-tooltip="'Eliminar'"
        color="error"
        @click="deleteItem(item.id)"
      />
      <BitacoraModal
        v-if="can('ver vacantes', 'Vacante')"
        :model-id="item.id"
        :model-type="MODEL_TYPE_VACANTE"
        titulo="Bitácora de la vacante"
        tooltip="Ver bitácora"
        variant="tonal"
        circular
        class="mr-1"
      />
    </template>
  </DataTableComponent>
</template>
<style scoped lang="scss">

</style>

<script setup lang="ts">
import Fields from '@/views/pages/catalogos/unidad/fields.vue'
import type { UnidadInterface } from '@/types/catalogos/unidad/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-unidad',
  middleware: 'permissions',
  action: 'editar unidades',
  subject: 'Unidad',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemUnidad = ref<UnidadInterface>(
{ codigo: null,
nombre: null,
emails: null,
estado: null,
regiones_id: null,
gerencia_id: null,
jefe_id: null,
auxiliar_id: null,
municipio_id: null,
departamento_id: null,
latitud: null,
longitud: null }
)

const actualizarUnidad = async (Unidad: UnidadInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<UnidadInterface>>(`api/catalogo/unidades/${id}`, Unidad)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/unidad')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getUnidad = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<UnidadInterface>>(`api/catalogo/unidades/${id}`)

    itemUnidad.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getUnidad()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar unidad
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/unidad"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemUnidad)"
        :item="itemUnidad"
        @emitir-datos="actualizarUnidad"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

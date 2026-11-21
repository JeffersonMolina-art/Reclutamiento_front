<script setup lang="ts">
import Fields from '@/views/pages/catalogos/region/fields.vue'
import type { RegionInterface } from '@/types/catalogos/region/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-region',
  middleware: 'permissions',
  action: 'editar regiones',
  subject: 'Region',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemRegion = ref<RegionInterface>(
{ codigo: null,
nombre: null,
estado: null }
)

const actualizarRegion = async (Region: RegionInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<RegionInterface>>(`api/catalogo/regiones/${id}`, Region)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/region')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getRegion = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<RegionInterface>>(`api/catalogo/regiones/${id}`)

    itemRegion.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getRegion()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar region
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/region"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemRegion)"
        :item="itemRegion"
        @emitir-datos="actualizarRegion"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

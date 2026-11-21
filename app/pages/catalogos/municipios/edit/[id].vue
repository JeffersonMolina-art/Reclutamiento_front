<script setup lang="ts">
import Fields from '@/views/pages/catalogos/municipios/fields.vue'
import type { MunicipioInterface } from '@/types/catalogos/municipios/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-municipios',
  middleware: 'permissions',
  action: 'editar municipios',
  subject: 'Municipio',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemMunicipio = ref<MunicipioInterface>(
{ codigo: null,
nombre: null,
estado: null,
departamento_id: null,
existe_agencia: null }
)

const actualizarMunicipio = async (Municipio: MunicipioInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<MunicipioInterface>>(`api/catalogo/municipios/${id}`, Municipio)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/municipios')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getMunicipio = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<MunicipioInterface>>(`api/catalogo/municipios/${id}`)

    itemMunicipio.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getMunicipio()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar municipio
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/municipios"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemMunicipio)"
        :item="itemMunicipio"
        @emitir-datos="actualizarMunicipio"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

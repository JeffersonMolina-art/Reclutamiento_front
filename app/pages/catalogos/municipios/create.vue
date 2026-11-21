<script setup lang="ts">
import Fields from '@/views/pages/catalogos/municipios/fields.vue'
import type { MunicipioInterface } from '@/types/catalogos/municipios/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-municipios',
  middleware: 'permissions',
  action: 'crear municipios',
  subject: 'Municipio',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarMunicipio = async (Municipio: MunicipioInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<MunicipioInterface>>('/api/catalogo/municipios', Municipio)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/municipios')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Crear municipio
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
      <Fields @emitir-datos="guardarMunicipio" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

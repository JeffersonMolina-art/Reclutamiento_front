<script setup lang="ts">
import Fields from '@/views/pages/catalogos/pais/fields.vue'
import type { PaisInterface } from '@/types/catalogos/pais/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-pais',
  middleware: 'permissions',
  action: 'crear pais',
  subject: 'Pais',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarPais = async (Pais: PaisInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<PaisInterface>>('/api/catalogo/pais', Pais)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/pais')
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
      Crear pais
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/pais"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarPais" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

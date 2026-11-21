<script setup lang="ts">
import Fields from '@/views/pages/catalogos/gerencia/fields.vue'
import type { GerenciaInterface } from '@/types/catalogos/gerencia/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-gerencia',
  middleware: 'permissions',
  action: 'crear gerencias',
  subject: 'Gerencia',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarGerencia = async (Gerencia: GerenciaInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<GerenciaInterface>>('/api/catalogo/gerencias', Gerencia)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/gerencia')
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
      Crear gerencia
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/gerencia"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarGerencia" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

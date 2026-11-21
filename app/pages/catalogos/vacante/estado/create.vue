<script setup lang="ts">
import Fields from '@/views/pages/catalogos/vacante/estado/fields.vue'
import type { VacanteEstadoInterface } from '@/types/catalogos/vacante/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-vacante-estado',
  middleware: 'permissions',
  action: 'crear vacante estados',
  subject: 'VacanteEstado',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarVacanteEstado = async (VacanteEstado: VacanteEstadoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<VacanteEstadoInterface>>('/api/catalogo/vacantes_estados', VacanteEstado)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/vacante/estado')
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
      Crear vacanteestado
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/vacante/estado"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarVacanteEstado" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

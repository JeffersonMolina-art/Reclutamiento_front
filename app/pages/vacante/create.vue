<script setup lang="ts">
import Fields from '@/views/pages/vacante/fields.vue'
import type { VacanteInterface } from '@/types/vacante/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'vacante',
  middleware: 'permissions',
  action: 'crear vacantes',
  subject: 'Vacante',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarVacante = async (Vacante: VacanteInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<VacanteInterface>>('/api/reclutamiento/vacantes', Vacante)

    showToastSuccess(respuesta.message)
    navigateTo('/vacante')
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
      Crear vacante
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/vacante"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarVacante" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

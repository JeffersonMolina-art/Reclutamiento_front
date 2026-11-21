<script setup lang="ts">
import Fields from '@/views/pages/catalogos/bandeja/fields.vue'
import type { BandejaInterface } from '@/types/catalogos/bandeja/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-bandeja',
  middleware: 'permissions',
  action: 'crear bandejas',
  subject: 'Bandeja',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarBandeja = async (Bandeja: BandejaInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<BandejaInterface>>('/api/catalogo/bandeja', Bandeja)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/bandeja')
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
      Crear bandeja
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/bandeja"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarBandeja" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

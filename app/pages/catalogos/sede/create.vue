<script setup lang="ts">
import Fields from '@/views/pages/catalogos/sede/fields.vue'
import type { SedeInterface } from '@/types/catalogos/sede/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-sede',
  middleware: 'permissions',
  action: 'crear sedes',
  subject: 'Sede',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarSede = async (Sede: SedeInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<SedeInterface>>('/api/catalogo/sede', Sede)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/sede')
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
      Crear sede
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/sede"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarSede" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

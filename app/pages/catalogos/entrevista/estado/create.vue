<script setup lang="ts">
import Fields from '@/views/pages/catalogos/entrevista/estado/fields.vue'
import type { EntrevistaEstadoInterface } from '@/types/catalogos/entrevista/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-entrevista-estado',
  middleware: 'permissions',
  action: 'crear entrevista estados',
  subject: 'EntrevistaEstado',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarEntrevistaEstado = async (EntrevistaEstado: EntrevistaEstadoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<EntrevistaEstadoInterface>>('/api/catalogo/entrevistas_estado', EntrevistaEstado)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/entrevista/estado')
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
      Crear entrevistaestado
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/entrevista/estado"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarEntrevistaEstado" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

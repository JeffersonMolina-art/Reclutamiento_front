<script setup lang="ts">
import Fields from '@/views/pages/catalogos/postulacion/estado/fields.vue'
import type { PostulacionEstadoInterface } from '@/types/catalogos/postulacion/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-postulacion-estado',
  middleware: 'permissions',
  action: 'crear postulacion estados',
  subject: 'PostulacionEstado',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarPostulacionEstado = async (PostulacionEstado: PostulacionEstadoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<PostulacionEstadoInterface>>('/api/catalogo/postulacion_estado', PostulacionEstado)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/postulacion/estado')
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
      Crear postulacionestado
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/postulacion/estado"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarPostulacionEstado" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

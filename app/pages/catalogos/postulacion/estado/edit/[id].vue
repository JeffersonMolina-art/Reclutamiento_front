<script setup lang="ts">
import Fields from '@/views/pages/catalogos/postulacion/estado/fields.vue'
import type { PostulacionEstadoInterface } from '@/types/catalogos/postulacion/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-postulacion-estado',
  middleware: 'permissions',
  action: 'editar postulacion estados',
  subject: 'PostulacionEstado',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemPostulacionEstado = ref<PostulacionEstadoInterface>(
{ nombre: null,
bandeja_id: null,
codigo: null }
)

const actualizarPostulacionEstado = async (PostulacionEstado: PostulacionEstadoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<PostulacionEstadoInterface>>(`api/catalogo/postulacion_estado/${id}`, PostulacionEstado)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/postulacion/estado')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getPostulacionEstado = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<PostulacionEstadoInterface>>(`api/catalogo/postulacion_estado/${id}`)

    itemPostulacionEstado.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getPostulacionEstado()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar postulacionestado
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
      <Fields
        v-if="tieneDatos(itemPostulacionEstado)"
        :item="itemPostulacionEstado"
        @emitir-datos="actualizarPostulacionEstado"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

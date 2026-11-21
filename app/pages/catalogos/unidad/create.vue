<script setup lang="ts">
import Fields from '@/views/pages/catalogos/unidad/fields.vue'
import type { UnidadInterface } from '@/types/catalogos/unidad/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-unidad',
  middleware: 'permissions',
  action: 'crear unidades',
  subject: 'Unidad',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarUnidad = async (Unidad: UnidadInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<UnidadInterface>>('/api/catalogo/unidades', Unidad)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/unidad')
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
      Crear unidad
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/unidad"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarUnidad" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

<script setup lang="ts">
import Fields from '@/views/pages/catalogos/puesto/fields.vue'
import type { PuestoInterface } from '@/types/catalogos/puesto/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-puesto',
  middleware: 'permissions',
  action: 'crear puestos',
  subject: 'Puesto',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarPuesto = async (Puesto: PuestoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<PuestoInterface>>('/api/catalogo/puestos', Puesto)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/puesto')
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
      Crear puesto
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/puesto"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarPuesto" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

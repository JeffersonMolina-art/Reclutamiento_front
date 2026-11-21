<script setup lang="ts">
import Fields from '@/views/pages/catalogos/departamento/fields.vue'
import type { DepartamentoInterface } from '@/types/catalogos/departamento/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-departamento',
  middleware: 'permissions',
  action: 'crear departamentos',
  subject: 'Departamento',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarDepartamento = async (Departamento: DepartamentoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<DepartamentoInterface>>('/api/catalogo/departamentos', Departamento)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/departamento')
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
      Crear departamento
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/departamento"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarDepartamento" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

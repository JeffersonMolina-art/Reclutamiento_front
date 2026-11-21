<script setup lang="ts">
import Fields from '@/views/pages/catalogos/vacante/estado/fields.vue'
import type { VacanteEstadoInterface } from '@/types/catalogos/vacante/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-vacante-estado',
  middleware: 'permissions',
  action: 'editar vacante estados',
  subject: 'VacanteEstado',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemVacanteEstado = ref<VacanteEstadoInterface>(
{ nombre: null,
codigo: null }
)

const actualizarVacanteEstado = async (VacanteEstado: VacanteEstadoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<VacanteEstadoInterface>>(`api/catalogo/vacantes_estados/${id}`, VacanteEstado)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/vacante/estado')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getVacanteEstado = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<VacanteEstadoInterface>>(`api/catalogo/vacantes_estados/${id}`)

    itemVacanteEstado.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getVacanteEstado()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar vacanteestado
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
      <Fields
        v-if="tieneDatos(itemVacanteEstado)"
        :item="itemVacanteEstado"
        @emitir-datos="actualizarVacanteEstado"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

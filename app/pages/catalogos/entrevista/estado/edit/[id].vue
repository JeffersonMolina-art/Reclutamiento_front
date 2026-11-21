<script setup lang="ts">
import Fields from '@/views/pages/catalogos/entrevista/estado/fields.vue'
import type { EntrevistaEstadoInterface } from '@/types/catalogos/entrevista/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-entrevista-estado',
  middleware: 'permissions',
  action: 'editar entrevista estados',
  subject: 'EntrevistaEstado',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemEntrevistaEstado = ref<EntrevistaEstadoInterface>(
{ nombre: null,
codigo: null }
)

const actualizarEntrevistaEstado = async (EntrevistaEstado: EntrevistaEstadoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<EntrevistaEstadoInterface>>(`api/catalogo/entrevistas_estado/${id}`, EntrevistaEstado)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/entrevista/estado')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getEntrevistaEstado = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<EntrevistaEstadoInterface>>(`api/catalogo/entrevistas_estado/${id}`)

    itemEntrevistaEstado.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getEntrevistaEstado()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar entrevistaestado
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
      <Fields
        v-if="tieneDatos(itemEntrevistaEstado)"
        :item="itemEntrevistaEstado"
        @emitir-datos="actualizarEntrevistaEstado"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

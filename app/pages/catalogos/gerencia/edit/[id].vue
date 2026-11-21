<script setup lang="ts">
import Fields from '@/views/pages/catalogos/gerencia/fields.vue'
import type { GerenciaInterface } from '@/types/catalogos/gerencia/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-gerencia',
  middleware: 'permissions',
  action: 'editar gerencias',
  subject: 'Gerencia',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemGerencia = ref<GerenciaInterface>(
{ codigo: null,
nombre: null,
estado: null }
)

const actualizarGerencia = async (Gerencia: GerenciaInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<GerenciaInterface>>(`api/catalogo/gerencias/${id}`, Gerencia)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/gerencia')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getGerencia = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<GerenciaInterface>>(`api/catalogo/gerencias/${id}`)

    itemGerencia.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getGerencia()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar gerencia
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/gerencia"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemGerencia)"
        :item="itemGerencia"
        @emitir-datos="actualizarGerencia"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

<script setup lang="ts">
import Fields from '@/views/pages/catalogos/pais/fields.vue'
import type { PaisInterface } from '@/types/catalogos/pais/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-pais',
  middleware: 'permissions',
  action: 'editar pais',
  subject: 'Pais',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemPais = ref<PaisInterface>(
{ codigo: null,
nombre: null,
nacionalidad: null,
estado: null }
)

const actualizarPais = async (Pais: PaisInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<PaisInterface>>(`api/catalogo/pais/${id}`, Pais)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/pais')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getPais = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<PaisInterface>>(`api/catalogo/pais/${id}`)

    itemPais.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getPais()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar pais
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/pais"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemPais)"
        :item="itemPais"
        @emitir-datos="actualizarPais"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

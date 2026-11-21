<script setup lang="ts">
import Fields from '@/views/pages/catalogos/sede/fields.vue'
import type { SedeInterface } from '@/types/catalogos/sede/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-sede',
  middleware: 'permissions',
  action: 'editar sedes',
  subject: 'Sede',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemSede = ref<SedeInterface>(
{ nombre: null }
)

const actualizarSede = async (Sede: SedeInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<SedeInterface>>(`api/catalogo/sede/${id}`, Sede)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/sede')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getSede = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<SedeInterface>>(`api/catalogo/sede/${id}`)

    itemSede.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getSede()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar sede
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/sede"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemSede)"
        :item="itemSede"
        @emitir-datos="actualizarSede"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

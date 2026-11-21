<script setup lang="ts">
import Fields from '@/views/pages/catalogos/bandeja/fields.vue'
import type { BandejaInterface } from '@/types/catalogos/bandeja/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-bandeja',
  middleware: 'permissions',
  action: 'editar bandejas',
  subject: 'Bandeja',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemBandeja = ref<BandejaInterface>(
{ nombre: null,
codigo: null }
)

const actualizarBandeja = async (Bandeja: BandejaInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<BandejaInterface>>(`api/catalogo/bandeja/${id}`, Bandeja)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/bandeja')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getBandeja = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<BandejaInterface>>(`api/catalogo/bandeja/${id}`)

    itemBandeja.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getBandeja()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar bandeja
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/bandeja"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemBandeja)"
        :item="itemBandeja"
        @emitir-datos="actualizarBandeja"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

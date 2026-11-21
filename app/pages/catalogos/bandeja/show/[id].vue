<script setup lang="ts">
import type { BandejaInterface } from '@/types/catalogos/bandeja/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-bandeja',
  middleware: 'permissions',
  action: 'ver bandejas',
  subject: 'Bandeja',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<BandejaInterface>(
{ nombre: null,
codigo: null }
)

const getBandeja = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<BandejaInterface>>(`api/catalogo/bandeja/${id}`)

    item.value = respuesta.data
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
      Ver bandeja
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
      <VList
        v-if="tieneDatos(item)"
        class="card-list mt-2"
      >
        
      <VListItemTitle>
        <h6 class="text-h6">
          Nombre:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.nombre }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Codigo:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.codigo }}
          </div>
        </h6>
      </VListItemTitle>
    
      </VList>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

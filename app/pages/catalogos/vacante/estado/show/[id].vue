<script setup lang="ts">
import type { VacanteEstadoInterface } from '@/types/catalogos/vacante/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-vacante-estado',
  middleware: 'permissions',
  action: 'ver vacante estados',
  subject: 'VacanteEstado',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<VacanteEstadoInterface>(
{ nombre: null,
codigo: null }
)

const getVacanteEstado = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<VacanteEstadoInterface>>(`api/catalogo/vacantes_estados/${id}`)

    item.value = respuesta.data
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
      Ver vacanteestado
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

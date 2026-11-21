<script setup lang="ts">
import type { MunicipioInterface } from '@/types/catalogos/municipios/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-municipios',
  middleware: 'permissions',
  action: 'ver municipios',
  subject: 'Municipio',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<MunicipioInterface>(
{ codigo: null,
nombre: null,
estado: null,
departamento_id: null,
existe_agencia: null }
)

const getMunicipio = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<MunicipioInterface>>(`api/catalogo/municipios/${id}`)

    item.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getMunicipio()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Ver municipio
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/municipios"
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
          Codigo:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.codigo }}
          </div>
        </h6>
      </VListItemTitle>
    
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
          Estado:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.estado }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Departamento:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.departamento_id }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Existe Agencia:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.existe_agencia }}
          </div>
        </h6>
      </VListItemTitle>
    
      </VList>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

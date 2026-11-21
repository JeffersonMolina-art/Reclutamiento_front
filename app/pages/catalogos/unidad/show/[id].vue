<script setup lang="ts">
import type { UnidadInterface } from '@/types/catalogos/unidad/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-unidad',
  middleware: 'permissions',
  action: 'ver unidades',
  subject: 'Unidad',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<UnidadInterface>(
{ codigo: null,
nombre: null,
emails: null,
estado: null,
regiones_id: null,
gerencia_id: null,
jefe_id: null,
auxiliar_id: null,
municipio_id: null,
departamento_id: null,
latitud: null,
longitud: null }
)

const getUnidad = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<UnidadInterface>>(`api/catalogo/unidades/${id}`)

    item.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getUnidad()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Ver unidad
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/unidad"
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
          Emails:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.emails }}
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
          Regiones:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.regiones_id }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Gerencia:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.gerencia_id }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Jefe:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.jefe_id }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Auxiliar:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.auxiliar_id }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Municipio:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.municipio_id }}
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
          Latitud:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.latitud }}
          </div>
        </h6>
      </VListItemTitle>
    
      <VListItemTitle>
        <h6 class="text-h6">
          Longitud:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.longitud }}
          </div>
        </h6>
      </VListItemTitle>
    
      </VList>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

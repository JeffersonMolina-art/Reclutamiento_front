<script setup lang="ts">
import type { PuestoInterface } from '@/types/catalogos/puesto/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-puesto',
  middleware: 'permissions',
  action: 'ver puestos',
  subject: 'Puesto',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<PuestoInterface>(
{ nombre: null,
gerencia_id: null,
estado: null }
)

const getPuesto = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<PuestoInterface>>(`api/catalogo/puestos/${id}`)

    item.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getPuesto()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Ver puesto
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/puesto"
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
          Gerencia:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.nombre_gerencia }}
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
    
      </VList>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

<script setup lang="ts">
import type { DepartamentoInterface } from '@/types/catalogos/departamento/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-departamento',
  middleware: 'permissions',
  action: 'ver departamentos',
  subject: 'Departamento',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<DepartamentoInterface>(
{ codigo: null,
nombre: null,
estado: null,
codigo_bankworks: null }
)

const getDepartamento = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<DepartamentoInterface>>(`api/catalogo/departamentos/${id}`)

    item.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getDepartamento()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Ver departamento
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/departamento"
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

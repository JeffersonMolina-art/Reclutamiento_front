<script setup lang="ts">
import type { SedeInterface } from '@/types/catalogos/sede/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-sede',
  middleware: 'permissions',
  action: 'ver sedes',
  subject: 'Sede',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<SedeInterface>(
{ nombre: null }
)

const getSede = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<SedeInterface>>(`api/catalogo/sede/${id}`)

    item.value = respuesta.data
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
      Ver sede
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
    
      </VList>
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

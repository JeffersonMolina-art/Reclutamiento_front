<script setup lang="ts">
import type { PostulacionEstadoInterface } from '@/types/catalogos/postulacion/estado/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-postulacion-estado',
  middleware: 'permissions',
  action: 'ver postulacion estados',
  subject: 'PostulacionEstado',
})

const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const item = ref<PostulacionEstadoInterface>(
{ nombre: null,
bandeja_id: null,
codigo: null }
)

const getPostulacionEstado = async () => {
  try {
    paginaEspera.value = true
    const respuesta = await get<SendResponseInterface<PostulacionEstadoInterface>>(`api/catalogo/postulacion_estado/${id}`)

    item.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getPostulacionEstado()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Ver postulacionestado
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/postulacion/estado"
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
          Bandeja:
          <div class="d-inline-block text-capitalize text-body-1">
            {{ item.bandeja_id }}
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

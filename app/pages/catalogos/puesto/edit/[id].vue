<script setup lang="ts">
import Fields from '@/views/pages/catalogos/puesto/fields.vue'
import type { PuestoInterface } from '@/types/catalogos/puesto/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-puesto',
  middleware: 'permissions',
  action: 'editar puestos',
  subject: 'Puesto',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemPuesto = ref<PuestoInterface>(
{ nombre: null,
gerencia_id: null,
estado: null }
)

const actualizarPuesto = async (Puesto: PuestoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<PuestoInterface>>(`api/catalogo/puestos/${id}`, Puesto)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/puesto')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getPuesto = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<PuestoInterface>>(`api/catalogo/puestos/${id}`)

    itemPuesto.value = respuesta.data
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
      Editar puesto
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
      <Fields
        v-if="tieneDatos(itemPuesto)"
        :item="itemPuesto"
        @emitir-datos="actualizarPuesto"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

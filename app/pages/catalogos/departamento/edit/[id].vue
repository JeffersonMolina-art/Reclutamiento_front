<script setup lang="ts">
import Fields from '@/views/pages/catalogos/departamento/fields.vue'
import type { DepartamentoInterface } from '@/types/catalogos/departamento/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-departamento',
  middleware: 'permissions',
  action: 'editar departamentos',
  subject: 'Departamento',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemDepartamento = ref<DepartamentoInterface>(
{ codigo: null,
nombre: null,
estado: null,
codigo_bankworks: null }
)

const actualizarDepartamento = async (Departamento: DepartamentoInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<DepartamentoInterface>>(`api/catalogo/departamentos/${id}`, Departamento)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/departamento')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getDepartamento = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<DepartamentoInterface>>(`api/catalogo/departamentos/${id}`)

    itemDepartamento.value = respuesta.data
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
      Editar departamento
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
      <Fields
        v-if="tieneDatos(itemDepartamento)"
        :item="itemDepartamento"
        @emitir-datos="actualizarDepartamento"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

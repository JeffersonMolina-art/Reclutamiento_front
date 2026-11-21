<script setup lang="ts">
import Fields from '@/views/pages/vacante/fields.vue'
import type { VacanteInterface } from '@/types/vacante/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'vacante',
  middleware: 'permissions',
  action: 'editar vacantes',
  subject: 'Vacante',
})

const { put, get } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const route = useRoute()
const id = route.params.id
const itemVacante = ref<VacanteInterface>({
  estado_id: null,
  puesto_id: null,
  sede_id: null,
  nombre: null,
  descripcion: null,
  cantidad_plazas: null,
  user_id: null,
  fecha_publicacion: null,
  user_encargado: null,
  modalidad_trabajo: null,
  salario_minimo: null,
  salario_maximo: null,
  requisitos: [],
  caracteristicas: [],
})

const actualizarVacante = async (Vacante: VacanteInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await put<SendResponseInterface<VacanteInterface>>(`api/reclutamiento/vacantes/${id}`, Vacante)

    showToastSuccess(respuesta.message)
    navigateTo('/vacante')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

const getVacante = async () => {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<VacanteInterface>>(`api/reclutamiento/vacantes/${id}`)

    itemVacante.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}

getVacante()
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Editar vacante
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/vacante"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields
        v-if="tieneDatos(itemVacante)"
        :item="itemVacante"
        @emitir-datos="actualizarVacante"
      />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

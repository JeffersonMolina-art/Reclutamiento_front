<script setup lang="ts">
import Fields from '@/views/pages/catalogos/region/fields.vue'
import type { RegionInterface } from '@/types/catalogos/region/types'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  navActiveLink: 'catalogos-region',
  middleware: 'permissions',
  action: 'crear regiones',
  subject: 'Region',
})

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()
const { paginaEspera } = useCargandoPagina()

const guardarRegion = async (Region: RegionInterface): Promise<void> => {
  paginaEspera.value = true
  try {
    const respuesta = await post<SendResponseInterface<RegionInterface>>('/api/catalogo/regiones', Region)

    showToastSuccess(respuesta.message)
    navigateTo('/catalogos/region')
  }
  catch (error: any) {
    manejaError(error)
  }
  paginaEspera.value = false
}
</script>

<template>
  <div class="d-flex flex-wrap justify-end justify-sm-space-between gap-y-4 gap-x-6 mb-4">
    <h1>
      Crear region
    </h1>
    <VBtn
      class="ml-auto"
      color="secondary"
      to="/catalogos/region"
    >
      <VIcon class="tabler-arrow-back-up mr-1" />
      Regresar
    </VBtn>
  </div>

  <VCard>
    <VCardText>
      <Fields @emitir-datos="guardarRegion" />
    </VCardText>
  </VCard>
</template>

<style scoped lang="scss">

</style>

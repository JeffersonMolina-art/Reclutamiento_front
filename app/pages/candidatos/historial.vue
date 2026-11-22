<script setup lang="ts">
import CandidatoHistorialModal from '@/components/candidatos/CandidatoHistorialModal.vue'
import CandidatosListado from '@/components/candidatos/CandidatosListado.vue'
import type { HistorialCandidato } from '@/types/reclutamiento/candidato'
import type { SendResponseInterface } from '@/types/sistema/types'

definePageMeta({
  middleware: 'permissions',
  action: 'historial candidatos',
  subject: 'Candidato',
})

const { get } = useClienteRequest()

const mostrarHistorial = ref(false)
const historial = ref<HistorialCandidato | null>(null)
const cargandoId = ref<number | null>(null)

async function verHistorial(id: number) {
  cargandoId.value = id

  try {
    const respuesta = await get<SendResponseInterface<HistorialCandidato>>(
      `api/reclutamiento/candidatos/${id}/postulaciones`,
    )

    historial.value = respuesta.data
    mostrarHistorial.value = true
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    cargandoId.value = null
  }
}
</script>

<template>
  <div class="mb-4">
    <h1>Historial de candidatos</h1>
  </div>

  <CandidatosListado>
    <template #acciones="{ item }">
      <VBtn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-timeline"
        :loading="cargandoId === item.id"
        @click="verHistorial(item.id)"
      >
        Ver historial
      </VBtn>
    </template>
  </CandidatosListado>

  <CandidatoHistorialModal
    v-model="mostrarHistorial"
    :historial="historial"
  />
</template>

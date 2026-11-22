<script setup lang="ts">
import CandidatoDetalleModal from '@/components/candidatos/CandidatoDetalleModal.vue'
import CandidatosListado from '@/components/candidatos/CandidatosListado.vue'
import type { CandidatoListado } from '@/types/reclutamiento/candidato'

definePageMeta({
  middleware: 'permissions',
  action: 'ver candidatos',
  subject: 'Candidato',
})

const mostrarDetalle = ref(false)
const candidatoSeleccionado = ref<CandidatoListado | null>(null)

function verCandidato(candidato: CandidatoListado) {
  candidatoSeleccionado.value = candidato
  mostrarDetalle.value = true
}
</script>

<template>
  <div class="mb-4">
    <h1>Candidatos</h1>
  </div>

  <CandidatosListado>
    <template #acciones="{ item }">
      <VBtn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="tabler-eye"
        @click="verCandidato(item)"
      >
        Ver
      </VBtn>
    </template>
  </CandidatosListado>

  <CandidatoDetalleModal
    v-model="mostrarDetalle"
    :candidato="candidatoSeleccionado"
  />
</template>

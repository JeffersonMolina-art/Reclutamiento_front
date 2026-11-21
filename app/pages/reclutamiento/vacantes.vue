<script setup lang="ts">
import type { VacantePublicaInterface } from '@/types/reclutamiento'

definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

const { obtenerVacantes } = usePortalReclutamiento()
const { showToastError } = useToast()

const vacantes = ref<VacantePublicaInterface[]>([])
const cargando = ref(false)
const buscar = ref('')
const pagina = ref(1)
const totalPaginas = ref(1)

const cargar = async () => {
  cargando.value = true

  try {
    const respuesta = await obtenerVacantes({ page: pagina.value, buscar: buscar.value })

    vacantes.value = respuesta.data
    totalPaginas.value = respuesta.meta?.last_page ?? 1
  }
  catch (error: any) {
    showToastError(error.response?.data?.message ?? 'No se pudieron cargar las vacantes')
  }
  finally {
    cargando.value = false
  }
}

let temporizador: ReturnType<typeof setTimeout>

watch(buscar, () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    pagina.value = 1
    cargar()
  }, 400)
})

watch(pagina, cargar)

onMounted(cargar)
</script>

<template>
  <VContainer class="py-10">
    <h1 class="text-h4 mb-6">
      Vacantes disponibles
    </h1>

    <AppTextField
      v-model="buscar"
      placeholder="Buscar vacante"
      prepend-inner-icon="tabler-search"
      clearable
      class="mb-6"
    />

    <div
      v-if="cargando"
      class="text-center py-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

    <VAlert
      v-else-if="!vacantes.length"
      type="info"
      variant="tonal"
    >
      No hay vacantes disponibles por el momento.
    </VAlert>

    <VRow v-else>
      <VCol
        v-for="vacante in vacantes"
        :key="vacante.id"
        cols="12"
        md="6"
      >
        <VCard class="h-100">
          <VCardItem>
            <VCardTitle>{{ vacante.titulo }}</VCardTitle>
            <VCardSubtitle>
              {{ [vacante.departamento, vacante.agencia].filter(Boolean).join(' · ') }}
            </VCardSubtitle>
          </VCardItem>
          <VCardText>
            <p class="text-truncate-3">
              {{ vacante.descripcion }}
            </p>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <VChip
                v-if="vacante.tipo_contrato"
                size="small"
                color="primary"
              >
                {{ vacante.tipo_contrato }}
              </VChip>
              <VChip
                v-if="vacante.fecha_cierre"
                size="small"
                color="warning"
              >
                Cierra: {{ vacante.fecha_cierre }}
              </VChip>
            </div>
          </VCardText>
          <VCardActions>
            <VBtn
              color="primary"
              :to="`/reclutamiento/registro?vacante=${vacante.id}`"
            >
              Aplicar
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VPagination
      v-if="totalPaginas > 1"
      v-model="pagina"
      :length="totalPaginas"
      class="mt-8"
    />
  </VContainer>
</template>

<style scoped>
.text-truncate-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>

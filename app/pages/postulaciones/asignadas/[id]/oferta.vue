<script setup lang="ts">
import type { OfertaEnviada, PostulacionDetalle } from '@/types/reclutamiento/oferta'
import type { SendResponseInterface } from '@/types/sistema/types'
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

const route = useRoute()
const { get } = useClienteRequest()

const urlBasePostulacion = computed(() =>
  `api/reclutamiento/postulaciones/${encodeURIComponent(String(route.params.id))}`,
)

const detallePostulacion = ref<PostulacionDetalle | null>(null)
const ofertaEnviada = ref<OfertaEnviada | null>(null)
const cargandoInformacion = ref(true)
const errorAlCargar = ref(false)

const puedeEnviarOferta = computed(() =>
  detallePostulacion.value?.estado?.codigo === 'oferta' && can('editar postulaciones', 'Postulacion'),
)

async function cargarInformacion() {
  cargandoInformacion.value = true
  errorAlCargar.value = false

  try {
    const [respuestaPostulacion, respuestaOferta] = await Promise.all([
      get<SendResponseInterface<PostulacionDetalle>>(urlBasePostulacion.value),
      get<SendResponseInterface<OfertaEnviada | null>>(`${urlBasePostulacion.value}/oferta`),
    ])

    detallePostulacion.value = respuestaPostulacion.data
    ofertaEnviada.value = respuestaOferta.data ?? null
  }
  catch (error) {
    errorAlCargar.value = true
    manejaError(error)
  }
  finally {
    cargandoInformacion.value = false
  }
}

onMounted(cargarInformacion)
</script>

<template>
  <div>
    <VBtn
      to="/postulaciones/asignadas"
      variant="text"
      prepend-icon="tabler-arrow-left"
      class="mb-4"
    >
      Volver a postulaciones
    </VBtn>

    <VProgressLinear
      v-if="cargandoInformacion"
      indeterminate
      color="primary"
    />

    <VAlert
      v-else-if="errorAlCargar"
      type="error"
      variant="tonal"
    >
      No se pudo cargar la postulación.
      <VBtn
        variant="text"
        @click="cargarInformacion"
      >
        Reintentar
      </VBtn>
    </VAlert>

    <template v-else-if="detallePostulacion">
      <OfertaEncabezado :postulacion="detallePostulacion" />
      <OfertaProgreso :codigo-estado="detallePostulacion.estado?.codigo" />

      <VRow class="mb-2">
        <VCol
          cols="12"
          md="6"
        >
          <OfertaCandidato :candidato="detallePostulacion.candidato" />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <OfertaVacante
            :vacante="detallePostulacion.vacante"
            :candidato="detallePostulacion.candidato"
          />
        </VCol>
      </VRow>

      <VRow class="mb-2">
        <VCol
          cols="12"
          md="6"
        >
          <OfertaExamenes :examenes="detallePostulacion.examenes" />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <OfertaEntrevistas :entrevistas="detallePostulacion.entrevistas ?? []" />
        </VCol>
      </VRow>

      <OfertaEnviadaCard
        v-if="ofertaEnviada"
        :oferta="ofertaEnviada"
      />

      <OfertaFormulario
        v-else-if="puedeEnviarOferta"
        :url-oferta="`${urlBasePostulacion}/oferta`"
        :vacante="detallePostulacion.vacante"
        :candidato="detallePostulacion.candidato"
        @enviada="ofertaEnviada = $event"
      />

      <VAlert
        v-else
        type="info"
        variant="tonal"
      >
        Todavía no se ha enviado una oferta para esta postulación.
      </VAlert>
    </template>
  </div>
</template>

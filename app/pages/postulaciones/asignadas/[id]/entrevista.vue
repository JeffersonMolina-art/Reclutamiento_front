<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'
import { can } from '@layouts/plugins/casl'
import type { EstadoDisponible, Entrevista } from '@/types/entrevistas/types'
import { REGEX_MEET } from '@/constantes/Entrevistas'

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

interface PostulacionDetalle {
  id: number
  candidato?: {
    primer_nombre?: string | null
    segundo_nombre?: string | null
    tercer_nombre?: string | null
    primer_apellido?: string | null
    segundo_apellido?: string | null
  } | null
  vacante?: {
    nombre?: string | null
    titulo?: string | null
    puesto?: { nombre: string } | null
  } | null
  estado?: { codigo: string } | null
  entrevistas?: Entrevista[]
  estados_disponibles?: EstadoDisponible[]
}

const route = useRoute()
const { get } = useClienteRequest()

const postulacion = ref<PostulacionDetalle | null>(null)
const entrevistas = ref<Entrevista[]>([])
const cargando = ref(true)
const errorCarga = ref(false)
const dialogAgendar = ref(false)
const dialogVeredicto = ref(false)
const postulacionId = computed(() => (route.params as { id: string }).id)

const puedeAgendar = computed(() =>
  postulacion.value?.estado?.codigo === 'entrevista'
  && can('editar postulaciones', 'Postulacion'),
)

const puedeCambiarPaso = computed(() =>
  postulacion.value?.estado?.codigo === 'entrevista'
  && can('editar postulaciones', 'Postulacion'),
)

const hayEstadosDisponibles = computed(() => (postulacion.value?.estados_disponibles?.length ?? 0) > 0)

const hayEntrevistaAprobada = computed(() => entrevistas.value.some(e => e.resultado === 'aprobado'))

const nombrePlaza = computed(() => {
  const vacante = postulacion.value?.vacante

  return vacante?.puesto?.nombre || vacante?.nombre || vacante?.titulo
})

const reunionMeet = computed(() =>
  entrevistas.value.find(e => e.modalidad === 'virtual' && REGEX_MEET.test(e.ubicacion_o_enlace)),
)

async function cargarPostulacion() {
  cargando.value = true
  errorCarga.value = false

  try {
    const respuesta = await get<SendResponseInterface<PostulacionDetalle>>(`api/reclutamiento/postulaciones/${postulacionId.value}`)

    postulacion.value = respuesta.data
    entrevistas.value = [...(respuesta.data.entrevistas ?? [])]
      .sort((a, b) => b.id - a.id)
  }
  catch (error) {
    errorCarga.value = true
    manejaError(error)
  }
  finally {
    cargando.value = false
  }
}

function alAgendar(entrevista: Entrevista) {
  entrevistas.value.unshift(entrevista)
}

function alActualizar(entrevista: Entrevista) {
  const indice = entrevistas.value.findIndex(e => e.id === entrevista.id)

  if (indice !== -1)
    entrevistas.value[indice] = { ...entrevistas.value[indice], ...entrevista }
}

onMounted(cargarPostulacion)
</script>

<template>
  <div class="entrevistas">
    <VBtn
      to="/postulaciones/asignadas"
      variant="text"
      prepend-icon="tabler-arrow-left"
      class="mb-4"
    >
      Volver a postulaciones
    </VBtn>

    <VProgressLinear v-if="cargando" indeterminate color="primary" />

    <VAlert v-else-if="errorCarga" type="error" variant="tonal">
      No se pudo cargar la postulación.
      <VBtn variant="text" @click="cargarPostulacion">
        Reintentar
      </VBtn>
    </VAlert>

    <template v-else-if="postulacion">
      <VCard variant="outlined" class="entrevistas__encabezado mb-6">
        <VCardText class="d-flex flex-wrap align-center justify-space-between ga-4 pa-5">
          <div class="d-flex align-center ga-4">
            <VAvatar color="primary" variant="tonal" rounded="lg" size="48">
              <VIcon icon="tabler-calendar-event" />
            </VAvatar>

            <div>
              <h1 class="text-h4 mb-1">Entrevistas</h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ postulacion?.candidato?.nombre_completo || 'Candidato' }}
                <template v-if="nombrePlaza"> · {{ nombrePlaza }}</template>
              </p>
            </div>
          </div>

          <div class="d-flex flex-wrap align-center ga-3 ms-sm-auto">
            <VBtn
              v-if="reunionMeet"
              :href="reunionMeet.ubicacion_o_enlace"
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              variant="tonal"
              prepend-icon="tabler-video"
              append-icon="tabler-external-link"
            >
              Ir a Google Meet
            </VBtn>

            <VBtn
              v-else-if="puedeAgendar"
              color="primary"
              variant="tonal"
              prepend-icon="tabler-calendar-plus"
              @click="dialogAgendar = true"
            >
              Agendar entrevista
            </VBtn>

            <VBtn
              v-if="puedeCambiarPaso"
              color="success"
              variant="flat"
              prepend-icon="tabler-gavel"
              :disabled="!hayEntrevistaAprobada || !hayEstadosDisponibles"
              @click="dialogVeredicto = true"
            >
              Dar veredicto
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <h2 class="text-h6 mb-3">Entrevistas registradas</h2>

      <VCard v-if="!entrevistas.length" variant="outlined">
        <VCardText class="text-center py-8">
          <VIcon icon="tabler-calendar-off" size="30" class="mb-2 text-medium-emphasis" />
          <p class="text-body-2 text-medium-emphasis mb-0">
            Todavía no hay entrevistas registradas.
          </p>
        </VCardText>
      </VCard>

      <VRow v-else>
        <VCol
          v-for="entrevista in entrevistas"
          :key="entrevista.id"
          cols="12"
          lg="6"
        >
          <EntrevistaCard
            :entrevista="entrevista"
            @actualizada="alActualizar"
          />
        </VCol>
      </VRow>

      <EntrevistaVeredictoModal
        v-model:mostrar-modal="dialogVeredicto"
        :postulacion-id="postulacionId"
        :estados-disponibles="postulacion.estados_disponibles ?? []"
        @guardado="navigateTo('/postulaciones/asignadas')"
      />

      <EntrevistaAgendarModal
        v-model:mostrar-modal="dialogAgendar"
        :postulacion-id="postulacionId"
        @agendada="alAgendar"
      />
    </template>
  </div>
</template>

<style scoped>
.entrevistas__encabezado {
  border-inline-start: 3px solid rgb(var(--v-theme-primary));
}
</style>

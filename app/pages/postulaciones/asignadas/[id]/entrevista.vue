<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'
import { can } from '@layouts/plugins/casl'

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

interface Entrevista {
  id: number
  fecha_hora_programada: string
  modalidad: 'presencial' | 'virtual'
  ubicacion_o_enlace: string
  tipo_entrevista: string
  observaciones?: string | null
  estado?: { nombre: string } | null
}

interface PostulacionDetalle {
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
  estados_disponibles?: { id: number; codigo: string; nombre: string }[]
}

const route = useRoute()
const { get, post, put } = useClienteRequest()
const { showToastSuccess } = useToast()

const endpoint = computed(() =>
  `api/reclutamiento/postulaciones/${encodeURIComponent(String(route.params.id))}`,
)

const postulacion = ref<PostulacionDetalle | null>(null)
const entrevistas = ref<Entrevista[]>([])
const cargando = ref(true)
const errorCarga = ref(false)
const guardando = ref(false)
const dialogAgendar = ref(false)
const contacto = ref<{ nombre: string; correo?: string | null; telefono?: string | null } | null>(null)
const cargandoContacto = ref(false)
const formulario = reactive({
  fecha_hora_programada: '',
  modalidad: 'presencial' as Entrevista['modalidad'],
  ubicacion_o_enlace: '',
  tipo_entrevista: '',
  observaciones: '',
})

const modalidades = [
  { title: 'Presencial', value: 'presencial' },
  { title: 'Virtual', value: 'virtual' },
]

const puedeAgendar = computed(() =>
  postulacion.value?.estado?.codigo === 'entrevista'
  && can('editar postulaciones', 'Postulacion'),
)

const dialogVeredicto = ref(false)
const guardandoVeredicto = ref(false)
const veredicto = reactive<{ estado_id: number | null; comentario: string; puntaje_fase: number | string | null }>({
  estado_id: null,
  comentario: '',
  puntaje_fase: null,
})

const puedeCambiarPaso = computed(() =>
  entrevistas.value.length > 0
  && (postulacion.value?.estados_disponibles?.length ?? 0) > 0
  && can('editar postulaciones', 'Postulacion'),
)

function abrirVeredicto() {
  Object.assign(veredicto, { estado_id: null, comentario: '', puntaje_fase: null })
  dialogVeredicto.value = true
}

async function darVeredicto() {
  if (!veredicto.estado_id || !veredicto.comentario.trim() || guardandoVeredicto.value)
    return

  guardandoVeredicto.value = true

  try {
    const payload: Record<string, any> = {
      estado_id: veredicto.estado_id,
      comentario: veredicto.comentario.trim(),
    }

    if (veredicto.puntaje_fase !== null && veredicto.puntaje_fase !== '')
      payload.puntaje_fase = Number(veredicto.puntaje_fase)

    await put(endpoint.value, payload)
    showToastSuccess('Veredicto registrado')
    dialogVeredicto.value = false
    await navigateTo('/postulaciones/asignadas')
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    guardandoVeredicto.value = false
  }
}

const esVirtual = computed(() => formulario.modalidad === 'virtual')

const nombreCandidato = computed(() => {
  const candidato = postulacion.value?.candidato

  return [
    candidato?.primer_nombre,
    candidato?.segundo_nombre,
    candidato?.tercer_nombre,
    candidato?.primer_apellido,
    candidato?.segundo_apellido,
  ].filter(Boolean).join(' ')
})

const nombrePlaza = computed(() => {
  const vacante = postulacion.value?.vacante

  return vacante?.puesto?.nombre || vacante?.nombre || vacante?.titulo
})

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
})

const regexMeet = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:\?\S*)?$/i

function formatearFecha(valor: string) {
  const fecha = new Date(valor)

  return Number.isNaN(fecha.getTime()) ? valor : formatoFecha.format(fecha)
}

const reunionMeet = computed(() =>
  entrevistas.value.find(e => e.modalidad === 'virtual' && regexMeet.test(e.ubicacion_o_enlace)),
)

async function abrirAgendar() {
  dialogAgendar.value = true

  if (contacto.value)
    return

  cargandoContacto.value = true

  try {
    const respuesta = await get<SendResponseInterface<NonNullable<typeof contacto.value>>>(`${endpoint.value}/contacto`)

    contacto.value = respuesta.data
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    cargandoContacto.value = false
  }
}

async function cargarPostulacion() {
  cargando.value = true
  errorCarga.value = false

  try {
    const respuesta = await get<SendResponseInterface<PostulacionDetalle>>(endpoint.value)

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

async function agendarEntrevista() {
  if (!puedeAgendar.value || guardando.value)
    return

  guardando.value = true

  try {
    const respuesta = await post<SendResponseInterface<Entrevista>>(
      `${endpoint.value}/entrevistas`,
      {
        ...formulario,
        fecha_hora_programada: formulario.fecha_hora_programada.replace('T', ' '),
        ubicacion_o_enlace: formulario.ubicacion_o_enlace.trim(),
        tipo_entrevista: formulario.tipo_entrevista.trim(),
        observaciones: formulario.observaciones.trim() || null,
      },
    )

    entrevistas.value.unshift(respuesta.data)

    formulario.fecha_hora_programada = ''
    formulario.ubicacion_o_enlace = ''
    formulario.tipo_entrevista = ''
    formulario.observaciones = ''

    showToastSuccess('Entrevista programada con éxito.')
    dialogAgendar.value = false
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    guardando.value = false
  }
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
                {{ nombreCandidato || 'Candidato' }}
                <template v-if="nombrePlaza"> · {{ nombrePlaza }}</template>
              </p>
            </div>
          </div>

          <VBtn
            v-if="reunionMeet"
            :href="reunionMeet.ubicacion_o_enlace"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            prepend-icon="tabler-video"
            append-icon="tabler-external-link"
          >
            Ir a Google Meet
          </VBtn>

          <VBtn
            v-else-if="puedeAgendar"
            color="primary"
            prepend-icon="tabler-calendar-plus"
            @click="abrirAgendar"
          >
            Agendar entrevista
          </VBtn>

          <VBtn
            v-if="puedeCambiarPaso"
            color="success"
            prepend-icon="tabler-checks"
            @click="abrirVeredicto"
          >
            Dar veredicto
          </VBtn>
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
          <VCard variant="outlined" height="100%">
            <VCardText class="pa-5">
              <div class="d-flex flex-wrap align-start justify-space-between ga-3 mb-4">
                <div class="d-flex align-center ga-3">
                  <VAvatar
                    :color="entrevista.modalidad === 'virtual' ? 'info' : 'primary'"
                    variant="tonal"
                    rounded="lg"
                    size="40"
                  >
                    <VIcon
                      :icon="entrevista.modalidad === 'virtual' ? 'tabler-video' : 'tabler-map-pin'"
                      size="20"
                    />
                  </VAvatar>

                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold">
                      {{ entrevista.tipo_entrevista }}
                    </h3>
                    <span class="text-body-2 text-medium-emphasis">
                      {{ entrevista.modalidad === 'virtual' ? 'Virtual' : 'Presencial' }}
                    </span>
                  </div>
                </div>

                <VChip v-if="entrevista.estado" size="small" color="primary" variant="tonal" label>
                  {{ entrevista.estado.nombre }}
                </VChip>
              </div>

              <div class="d-flex align-center ga-2 text-body-2 mb-2">
                <VIcon icon="tabler-clock" size="18" class="text-medium-emphasis" />
                {{ formatearFecha(entrevista.fecha_hora_programada) }}
              </div>

              <div
                v-if="entrevista.modalidad === 'presencial'"
                class="d-flex align-center ga-2 text-body-2"
              >
                <VIcon icon="tabler-map-pin" size="18" class="text-medium-emphasis" />
                {{ entrevista.ubicacion_o_enlace }}
              </div>

              <div v-if="entrevista.observaciones" class="entrevistas__observaciones mt-4 pa-3">
                <div class="text-caption font-weight-medium mb-1">Observaciones</div>
                <p class="text-body-2 text-medium-emphasis text-pre-wrap mb-0">
                  {{ entrevista.observaciones }}
                </p>
              </div>

              <VBtn
                v-if="entrevista.modalidad === 'virtual' && regexMeet.test(entrevista.ubicacion_o_enlace)"
                :href="entrevista.ubicacion_o_enlace"
                target="_blank"
                rel="noopener noreferrer"
                variant="tonal"
                color="primary"
                size="small"
                append-icon="tabler-external-link"
                class="mt-4"
              >
                Unirse a Meet
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VDialog v-model="dialogVeredicto" :persistent="guardandoVeredicto" max-width="500">
        <VCard title="Dar veredicto">
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppSelect
                  v-model="veredicto.estado_id"
                  label="Siguiente paso"
                  :items="postulacion.estados_disponibles"
                  item-title="nombre"
                  item-value="id"
                />
              </VCol>
              <VCol cols="6">
                <AppTextField
                  v-model="veredicto.puntaje_fase"
                  label="Puntaje de esta fase"
                  type="number"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="veredicto.comentario"
                  label="Comentario"
                  maxlength="255"
                  rows="3"
                />
              </VCol>
            </VRow>
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn variant="text" @click="dialogVeredicto = false">
              Cancelar
            </VBtn>
            <VBtn
              color="success"
              :loading="guardandoVeredicto"
              :disabled="!veredicto.estado_id || !veredicto.comentario.trim()"
              @click="darVeredicto"
            >
              Confirmar
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>

      <VDialog v-model="dialogAgendar" :persistent="guardando" max-width="640">
        <VCard>
          <div class="d-flex align-center ga-3 pa-5">
            <VAvatar color="primary" variant="tonal" rounded="lg" size="40">
              <VIcon icon="tabler-calendar-plus" size="20" />
            </VAvatar>
            <h2 class="text-h6">Agendar entrevista</h2>
          </div>

          <VDivider />

          <form @submit.prevent="agendarEntrevista">
            <VCardText class="pa-5">
              <VProgressLinear v-if="cargandoContacto" indeterminate class="mb-4" />

              <div v-else-if="contacto" class="entrevistas__observaciones mb-4 pa-3">
                <div class="text-subtitle-2">{{ contacto.nombre }}</div>
                <div class="d-flex flex-wrap ga-3 text-body-2">
                  <a v-if="contacto.correo" :href="`mailto:${contacto.correo}`">
                    {{ contacto.correo }}
                  </a>
                  <a v-if="contacto.telefono" :href="`tel:${contacto.telefono}`">
                    {{ contacto.telefono }}
                  </a>
                  <span v-if="!contacto.correo && !contacto.telefono" class="text-medium-emphasis">
                    Sin datos de contacto
                  </span>
                </div>
              </div>

              <VRow dense>
                <VCol cols="12" sm="7">
                  <VTextField
                    v-model="formulario.fecha_hora_programada"
                    type="datetime-local"
                    label="Fecha y hora"
                    hint="Hora de Guatemala"
                    persistent-hint
                    required
                  />
                </VCol>

                <VCol cols="12" sm="5">
                  <VSelect
                    v-model="formulario.modalidad"
                    :items="modalidades"
                    label="Modalidad"
                    @update:model-value="formulario.ubicacion_o_enlace = ''"
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="formulario.tipo_entrevista"
                    label="Tipo de entrevista"
                    maxlength="255"
                    required
                  />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="formulario.ubicacion_o_enlace"
                    :label="esVirtual ? 'Enlace de Google Meet' : 'Lugar de la entrevista'"
                    :type="esVirtual ? 'url' : 'text'"
                    maxlength="500"
                    required
                  />

                  <VBtn
                    v-if="esVirtual"
                    href="https://meet.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="text"
                    color="primary"
                    size="small"
                    append-icon="tabler-external-link"
                    class="mb-2"
                  >
                    Abrir Google Meet
                  </VBtn>
                </VCol>

                <VCol cols="12">
                  <VTextarea
                    v-model="formulario.observaciones"
                    label="Observaciones"
                    rows="2"
                    maxlength="255"
                    hide-details="auto"
                  />
                </VCol>
              </VRow>
            </VCardText>

            <VDivider />

            <VCardActions class="justify-end ga-2 px-5 py-4">
              <VBtn
                type="button"
                variant="text"
                :disabled="guardando"
                @click="dialogAgendar = false"
              >
                Cancelar
              </VBtn>

              <VBtn type="submit" color="primary" variant="flat" :loading="guardando">
                Agendar entrevista
              </VBtn>
            </VCardActions>
          </form>
        </VCard>
      </VDialog>
    </template>
  </div>
</template>

<style scoped>
.entrevistas__encabezado {
  border-inline-start: 3px solid rgb(var(--v-theme-primary));
}

.entrevistas__observaciones {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 8px;
  overflow-wrap: anywhere;
}
</style>

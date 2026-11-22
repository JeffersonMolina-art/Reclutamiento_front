<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'
import { can } from '@layouts/plugins/casl'
import {MODEL_TYPE_POSTULACION} from "@/constantes/ModelTypes";

definePageMeta({
  middleware: 'permissions',
  action: 'ver postulaciones',
  subject: 'Postulacion',
})

const route = useRoute()
const { get, put } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()
const { showToastSuccess } = useToast()

const postulacion = ref<any>(null)
const guardando = ref(false)
const dialogoDecision = ref(false)

const formulario = ref<{ estado_id: number | null; comentario: string; puntaje_fase: number | null }>({
  estado_id: null,
  comentario: '',
  puntaje_fase: null,
})

const tiposExamen = [
  {
    coleccion: 'examenes_medicos',
    titulo: 'Examen médico',
    descripcion: 'Resultado de la evaluación médica del candidato',
    icono: 'tabler-stethoscope',
    color: 'error',
  },
  {
    coleccion: 'examenes_tecnicos',
    titulo: 'Examen técnico',
    descripcion: 'Resultado de la prueba de conocimientos del puesto',
    icono: 'tabler-code',
    color: 'info',
  },
]

const modalidades = ['Presencial', 'Virtual']

const evaluaciones = ref<Record<string, { puntuacion: number | string | null; modalidad: string | null; comentarios: string }>>({
  examenes_medicos: { puntuacion: null, modalidad: null, comentarios: '' },
  examenes_tecnicos: { puntuacion: null, modalidad: null, comentarios: '' },
})

const clavesInput = ref<Record<string, number>>({ examenes_medicos: 0, examenes_tecnicos: 0 })

const idPostulacion = computed(() => (route.params as { id: string }).id)
const candidato = computed(() => postulacion.value?.candidato)
const vacante = computed(() => postulacion.value?.vacante)
const examenes = computed(() => postulacion.value?.examenes ?? {})
const estadosDisponibles = computed<any[]>(() => postulacion.value?.estados_disponibles ?? [])
const requisitosVacante = computed<any[]>(() => vacante.value?.requisitos ?? [])
const puedeEditar = computed(() => can('editar postulaciones', 'Postulacion'))
const puedeDecidir = computed(() => estadosDisponibles.value.length > 0 && puedeEditar.value)

const inicialesCandidato = computed(() => {
  const datosCandidato = candidato.value
  if (!datosCandidato)
    return 'CA'

  return `${datosCandidato.primer_nombre?.[0] ?? ''}${datosCandidato.primer_apellido?.[0] ?? ''}`.toUpperCase() || 'C'
})

const datosContacto = computed(() => [
  { icono: 'tabler-id', etiqueta: 'DPI', valor: candidato.value?.dpi || '—' },
  { icono: 'tabler-mail', etiqueta: 'Correo electrónico', valor: candidato.value?.correo_contacto || '—' },
  { icono: 'tabler-phone', etiqueta: 'Teléfono', valor: candidato.value?.telefono_contacto || '—' },
  {
    icono: 'tabler-cash',
    etiqueta: 'Expectativa salarial',
    valor: candidato.value?.expectativa_salarial ? `Q ${candidato.value.expectativa_salarial}` : '—',
  },
])

const datosVacante = computed(() => [
  { icono: 'tabler-briefcase', etiqueta: 'Puesto', valor: vacante.value?.puesto?.nombre || vacante.value?.nombre || '—' },
  { icono: 'tabler-map-pin', etiqueta: 'Sede', valor: vacante.value?.sede?.nombre || '—' },
  {
    icono: 'tabler-coin',
    etiqueta: 'Rango salarial',
    valor: `Q ${vacante.value?.salario_minimo ?? '—'} – Q ${vacante.value?.salario_maximo ?? '—'}`,
  },
])

const examenCargado = (coleccion: string) => (examenes.value[coleccion]?.length ?? 0) > 0

const cantidadExamenesCargados = computed(() =>
  tiposExamen.filter(examen => examenCargado(examen.coleccion)).length,
)

const todosLosExamenesCargados = computed(() => cantidadExamenesCargados.value === tiposExamen.length)

function evaluacionCompleta(coleccion: string): boolean {
  const { puntuacion, modalidad } = evaluaciones.value[coleccion]

  return puntuacion !== null && String(puntuacion) !== '' && !!modalidad
}

function formatearFecha(valor?: string | null): string {
  if (!valor)
    return '—'

  const coincidencia = valor.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const fecha = coincidencia
    ? new Date(Number(coincidencia[1]), Number(coincidencia[2]) - 1, Number(coincidencia[3]))
    : new Date(valor)

  if (Number.isNaN(fecha.getTime()))
    return '—'

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha)
}

function formatearTamano(bytes?: number | string | null): string {
  const tamano = Number(bytes)
  if (!tamano)
    return '—'

  if (tamano < 1024 * 1024)
    return `${Math.round(tamano / 1024)} KB`

  return `${(tamano / (1024 * 1024)).toFixed(1)} MB`
}

function iconoArchivo(extension?: string | null): string {
  const iconos: Record<string, string> = {
    pdf: 'tabler-file-type-pdf',
    doc: 'tabler-file-type-doc',
    docx: 'tabler-file-type-doc',
    jpg: 'tabler-photo',
    jpeg: 'tabler-photo',
    png: 'tabler-photo',
  }

  return iconos[extension?.toLowerCase() ?? ''] ?? 'tabler-file'
}

async function cargarPostulacion() {
  paginaEspera.value = true
  try {
    const respuesta = await get<SendResponseInterface<any>>(
      `api/reclutamiento/postulaciones/${idPostulacion.value}`,
    )

    postulacion.value = respuesta.data
  }
  catch (error: any) {
    manejaError(error)
  }
  finally {
    paginaEspera.value = false
  }
}

async function alSubirArchivo(coleccion: string) {
  evaluaciones.value[coleccion] = { puntuacion: null, modalidad: null, comentarios: '' }
  await cargarPostulacion()
  clavesInput.value[coleccion]++
}

function abrirDecision() {
  formulario.value = { estado_id: null, comentario: '', puntaje_fase: null }
  dialogoDecision.value = true
}

async function guardarDecision() {
  if (!formulario.value.estado_id || !formulario.value.comentario)
    return

  guardando.value = true
  try {
    const payload: any = {
      estado_id: formulario.value.estado_id,
      comentario: formulario.value.comentario,
    }

    const puntaje = formulario.value.puntaje_fase
    if (puntaje !== null && String(puntaje) !== '')
      payload.puntaje_fase = Number(puntaje)

    await put(`api/reclutamiento/postulaciones/${idPostulacion.value}`, payload)
    showToastSuccess('Revisión registrada')
    dialogoDecision.value = false
    await navigateTo('/postulaciones/asignadas')
  }
  catch (error: any) {
    manejaError(error)
  }
  finally {
    guardando.value = false
  }
}

onMounted(cargarPostulacion)
</script>

<template>
  <div v-if="postulacion">
    <VCard class="mb-6">
      <VCardText class="d-flex flex-wrap justify-space-between align-center gap-4">
        <div class="d-flex align-center gap-4">
          <VAvatar
            color="primary"
            variant="tonal"
            size="56"
            rounded="lg"
          >
            <span class="text-h5 font-weight-bold">{{ inicialesCandidato }}</span>
          </VAvatar>

          <div>
            <div class="d-flex align-center flex-wrap gap-2 mb-1">
              <h4 class="text-h4 font-weight-semibold">
                {{ postulacion?.candidato?.nombre_completo || 'Candidato' }}
              </h4>
              <VChip
                v-if="postulacion.estado"
                color="primary"
                size="small"
                label
              >
                {{ postulacion.estado.nombre }}
              </VChip>
            </div>

            <div class="d-flex flex-wrap align-center gap-x-4 gap-y-1 text-body-2 text-medium-emphasis">
              <span class="d-flex align-center gap-1">
                <VIcon
                  icon="tabler-hash"
                  size="16"
                />
                Postulación #{{ postulacion.id }}
              </span>
              <span class="d-flex align-center gap-1">
                <VIcon
                  icon="tabler-calendar"
                  size="16"
                />
                {{ formatearFecha(postulacion.fecha_postulacion) }}
              </span>
              <span class="d-flex align-center gap-1 text-high-emphasis font-weight-medium">
                <VIcon
                  icon="tabler-briefcase"
                  size="16"
                  color="primary"
                />
                {{ vacante?.puesto?.nombre || vacante?.nombre }}
              </span>
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap align-center ga-3">
          <VBtn
            variant="text"
            color="secondary"
            prepend-icon="tabler-arrow-left"
            @click="navigateTo('/postulaciones/asignadas')"
          >
            Volver
          </VBtn>

          <BitacoraModal
            :model-id="postulacion.id"
            :model-type="MODEL_TYPE_POSTULACION"
            icon="tabler-history"
            text="Bitácora"
            tooltip="Bitácora"
            circular
          />

          <VBtn
            v-if="puedeDecidir"
            color="success"
            append-icon="tabler-arrow-right"
            @click="abrirDecision"
          >
            Siguiente paso
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <VRow class="mb-2">
      <VCol
        cols="12"
        md="6"
      >
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="primary"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon
                  icon="tabler-user"
                  size="20"
                />
              </VAvatar>
            </template>
            <VCardTitle>Datos del candidato</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText>
            <VRow dense>
              <VCol
                v-for="dato in datosContacto"
                :key="dato.etiqueta"
                cols="12"
                sm="6"
              >
                <div class="d-flex align-center gap-3">
                  <VIcon
                    :icon="dato.icono"
                    size="20"
                    class="text-medium-emphasis"
                  />
                  <div class="min-w-0">
                    <div class="text-caption text-medium-emphasis">
                      {{ dato.etiqueta }}
                    </div>
                    <div class="text-body-1 font-weight-medium text-break">
                      {{ dato.valor }}
                    </div>
                  </div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="info"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon
                  icon="tabler-building-skyscraper"
                  size="20"
                />
              </VAvatar>
            </template>
            <VCardTitle>Información de la vacante</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText class="d-flex flex-column gap-4">
            <VRow dense>
              <VCol
                v-for="dato in datosVacante"
                :key="dato.etiqueta"
                cols="12"
                sm="6"
              >
                <div class="d-flex align-center gap-3">
                  <VIcon
                    :icon="dato.icono"
                    size="20"
                    class="text-medium-emphasis"
                  />
                  <div class="min-w-0">
                    <div class="text-caption text-medium-emphasis">
                      {{ dato.etiqueta }}
                    </div>
                    <div class="text-body-1 font-weight-medium text-break">
                      {{ dato.valor }}
                    </div>
                  </div>
                </div>
              </VCol>
            </VRow>

            <VDivider />

            <div>
              <div class="text-overline text-medium-emphasis mb-2">
                Requisitos
              </div>

              <div
                v-if="requisitosVacante.length"
                class="d-flex flex-column gap-2"
              >
                <div
                  v-for="requisito in requisitosVacante"
                  :key="requisito.id"
                  class="d-flex align-center justify-space-between gap-2"
                >
                  <span class="text-body-2">{{ requisito.nombre }}</span>
                  <VChip
                    size="x-small"
                    label
                    variant="tonal"
                    :color="requisito.es_obligatorio ? 'error' : 'secondary'"
                  >
                    {{ requisito.es_obligatorio ? 'Obligatorio' : 'Deseable' }}
                  </VChip>
                </div>
              </div>

              <span
                v-else
                class="text-body-2 text-disabled"
              >La vacante no tiene requisitos registrados</span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        v-for="examen in tiposExamen"
        :key="examen.coleccion"
        cols="12"
        md="6"
      >
        <VCard class="h-100">
          <VCardItem>
            <template #prepend>
              <VAvatar
                :color="examen.color"
                variant="tonal"
                size="40"
                rounded
              >
                <VIcon
                  :icon="examen.icono"
                  size="22"
                />
              </VAvatar>
            </template>
            <VCardTitle>{{ examen.titulo }}</VCardTitle>
            <VCardSubtitle>{{ examen.descripcion }}</VCardSubtitle>

            <template #append>
              <VChip
                :color="examenCargado(examen.coleccion) ? 'success' : 'warning'"
                size="small"
                label
                variant="tonal"
              >
                {{ examenCargado(examen.coleccion) ? 'Cargado' : 'Pendiente' }}
              </VChip>
            </template>
          </VCardItem>

          <VDivider />

          <VCardText class="d-flex flex-column gap-5">
            <!-- Evaluaciones registradas -->
            <div v-if="examenes[examen.coleccion]?.length">
              <div class="text-overline text-medium-emphasis mb-3">
                Evaluaciones registradas
              </div>

              <div class="d-flex flex-column gap-3">
                <div
                  v-for="archivo in examenes[examen.coleccion]"
                  :key="archivo.id"
                  class="border rounded pa-4"
                >
                  <div class="d-flex align-center justify-space-between gap-3">
                    <div class="d-flex align-center gap-3 min-w-0">
                      <VAvatar
                        :color="examen.color"
                        variant="tonal"
                        rounded
                        size="40"
                      >
                        <VIcon
                          :icon="iconoArchivo(archivo.extension)"
                          size="22"
                        />
                      </VAvatar>
                      <div class="min-w-0">
                        <div class="text-body-1 font-weight-medium text-truncate">
                          {{ archivo.nombre }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ archivo.extension?.toUpperCase() }}
                          · {{ formatearTamano(archivo.tamano) }}
                          · Subido el {{ formatearFecha(archivo.subido_el) }}
                        </div>
                      </div>
                    </div>

                    <VBtn
                      :href="archivo.original_url"
                      target="_blank"
                      rel="noopener"
                      icon="tabler-external-link"
                      variant="text"
                      size="small"
                      aria-label="Abrir archivo"
                    />
                  </div>

                  <template v-if="archivo.evaluacion">
                    <VDivider class="my-3" />

                    <div class="d-flex flex-wrap gap-x-8 gap-y-3">
                      <div>
                        <div class="text-caption text-medium-emphasis">
                          Puntuación
                        </div>
                        <div class="text-h5 font-weight-bold text-primary">
                          {{ archivo.evaluacion.puntuacion }}
                        </div>
                      </div>

                      <div>
                        <div class="text-caption text-medium-emphasis">
                          Modalidad
                        </div>
                        <VChip
                          size="small"
                          label
                          variant="tonal"
                          class="mt-1"
                        >
                          {{ archivo.evaluacion.modalidad }}
                        </VChip>
                      </div>

                      <div>
                        <div class="text-caption text-medium-emphasis">
                          Fecha de evaluación
                        </div>
                        <div class="text-body-1 font-weight-medium">
                          {{ formatearFecha(archivo.evaluacion.fecha_evaluacion) }}
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="archivo.evaluacion.comentarios"
                      class="mt-3"
                    >
                      <div class="text-caption text-medium-emphasis">
                        Comentario
                      </div>
                      <div class="text-body-2 text-break">
                        {{ archivo.evaluacion.comentarios }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="puedeEditar">
              <div class="text-overline text-medium-emphasis mb-3">
                {{ examenCargado(examen.coleccion) ? 'Agregar otra evaluación' : '1. Registra la evaluación' }}
              </div>

              <VRow>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <AppTextField
                    v-model="evaluaciones[examen.coleccion].puntuacion"
                    label="Puntuación"
                    type="number"
                    min="0"
                  />
                </VCol>
                <VCol
                  cols="12"
                  sm="8"
                >
                  <AppSelect
                    v-model="evaluaciones[examen.coleccion].modalidad"
                    label="Modalidad"
                    :items="modalidades"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextarea
                    v-model="evaluaciones[examen.coleccion].comentarios"
                    label="Comentario"
                    maxlength="255"
                    counter
                    rows="2"
                  />
                </VCol>
              </VRow>
            </div>

            <div>
              <div class="text-overline text-medium-emphasis mb-3">
                {{ puedeEditar ? '2. Adjunta el archivo' : 'Archivos' }}
              </div>

              <VAlert
                v-if="puedeEditar && !evaluacionCompleta(examen.coleccion)"
                type="info"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                Ingresa la puntuación y la modalidad para habilitar la subida del archivo.
              </VAlert>

              <InputFile
                :key="`${examen.coleccion}-${clavesInput[examen.coleccion]}`"
                :multiple="false"
                subida-automatica
                campo-simple
                :url-subida="`api/reclutamiento/postulaciones/${idPostulacion}/archivos`"
                :url-eliminacion="`api/reclutamiento/postulaciones/${idPostulacion}/archivos`"
                name="archivo"
                :coleccion="examen.coleccion"
                :datos-extra="{ coleccion: examen.coleccion, ...evaluaciones[examen.coleccion] }"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                :max-size-mb="10"
                :lectura="!puedeEditar || !evaluacionCompleta(examen.coleccion)"
                :previsualizar-archivos="examenes[examen.coleccion] ?? []"
                @archivo-subido="alSubirArchivo(examen.coleccion)"
              />
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <ModalBasico
      v-model:mostrar-modal="dialogoDecision"
      titulo="Siguiente paso"
      subtitulo="Define cómo continúa la postulación"
      max-width="520"
      :persistent="guardando"
    >
      <VAlert
        v-if="!todosLosExamenesCargados"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        Aún faltan exámenes por cargar ({{ cantidadExamenesCargados }}/{{ tiposExamen.length }}).
      </VAlert>

      <VRow>
        <VCol cols="12">
          <AppSelect
            v-model="formulario.estado_id"
            label="Siguiente paso"
            :items="estadosDisponibles"
            item-title="nombre"
            item-value="id"
          />
        </VCol>
        <VCol cols="12">
          <AppTextField
            v-model="formulario.puntaje_fase"
            label="Puntaje de esta fase"
            type="number"
          />
        </VCol>
        <VCol cols="12">
          <AppTextarea
            v-model="formulario.comentario"
            label="Comentario"
            maxlength="255"
            counter
            rows="3"
          />
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-2 mt-4">
        <VBtn
          variant="text"
          color="secondary"
          :disabled="guardando"
          @click="dialogoDecision = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="success"
          variant="elevated"
          :loading="guardando"
          :disabled="!formulario.estado_id || !formulario.comentario"
          @click="guardarDecision"
        >
          Confirmar
        </VBtn>
      </div>
    </ModalBasico>
  </div>
</template>

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
const { get } = useClienteRequest()
const { paginaEspera } = useCargandoPagina()

const postulacion = ref<any>(null)
const urlVistaPreviaCurriculum = ref<string | null>(null)
const archivoCurriculum = ref<Blob | null>(null)
const cargandoCurriculum = ref(false)

const candidato = computed(() => postulacion.value?.candidato)
const curriculum = computed(() => postulacion.value?.cv)
const curriculumEsPdf = computed(() => curriculum.value?.extension?.toLowerCase() === 'pdf')

function parsearFecha(valor?: string | null): Date | null {
  if (!valor)
    return null

  const soloFecha = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (soloFecha) {
    const [, anio, mes, dia] = soloFecha
    return new Date(Number(anio), Number(mes) - 1, Number(dia))
  }

  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

function formatearFecha(valor?: string | null): string {
  const fecha = parsearFecha(valor)
  if (!fecha)
    return '—'

  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(fecha)
}

function formatearPeriodo(valor?: string | null): string {
  const fecha = parsearFecha(valor)
  if (!fecha)
    return ''

  const texto = new Intl.DateTimeFormat('es-GT', {
    month: 'short',
    year: 'numeric',
  }).format(fecha)

  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const inicialesCandidato = computed(() => {
  const c = candidato.value
  if (!c)
    return 'CA'
  return `${c.primer_nombre?.[0] ?? ''}${c.primer_apellido?.[0] ?? ''}`.toUpperCase() || 'CA'
})

const idPostulacion = computed(() => (route.params as { id: string }).id)

const { put } = useClienteRequest()
const { showToastSuccess, showToastError } = useToast()

const dialogVeredicto = ref(false)
const guardando = ref(false)
const form = ref<{ estado_id: number | null; comentario: string; puntaje_fase: number | null }>({
  estado_id: null,
  comentario: '',
  puntaje_fase: null,
})

const estadosDisponibles = computed<any[]>(() => postulacion.value?.estados_disponibles ?? [])

function abrirVeredicto() {
  form.value = { estado_id: null, comentario: '', puntaje_fase: null }
  dialogVeredicto.value = true
}

async function darVeredicto() {
  if (!form.value.estado_id || !form.value.comentario)
    return

  guardando.value = true
  try {
    const payload: any = { estado_id: form.value.estado_id, comentario: form.value.comentario }

    if (form.value.puntaje_fase !== null && form.value.puntaje_fase !== ('' as any))
      payload.puntaje_fase = Number(form.value.puntaje_fase)
    if (form.value.porcentaje !== null && form.value.porcentaje !== ('' as any))
      payload.porcentaje = Number(form.value.porcentaje)

    await put(`api/reclutamiento/postulaciones/${idPostulacion.value}`, payload)
    showToastSuccess('Veredicto registrado')
    dialogVeredicto.value = false
    await navigateTo('/postulaciones/asignadas')
  }
  catch (error: any) {
    manejaError(error)
  }
  finally {
    guardando.value = false
  }
}

async function cargarCurriculum() {
  if (!curriculum.value?.tiene_cv)
    return

  cargandoCurriculum.value = true
  try {
    const respuestaCurriculum: any = await get(
      `api/reclutamiento/postulaciones/${idPostulacion.value}/cv`,
      { responseType: 'blob' },
    )

    archivoCurriculum.value = respuestaCurriculum.data
    if (curriculumEsPdf.value)
      urlVistaPreviaCurriculum.value = URL.createObjectURL(respuestaCurriculum.data)
  }
  catch (error: any) {
    manejaError(error)
  }
  finally {
    cargandoCurriculum.value = false
  }
}

function descargarCurriculum() {
  if (!archivoCurriculum.value)
    return

  const urlDescarga = URL.createObjectURL(archivoCurriculum.value)
  const enlaceDescarga = document.createElement('a')

  enlaceDescarga.href = urlDescarga
  enlaceDescarga.download = `CURRICULUM-${postulacion.value?.candidato?.nombre_completo || idPostulacion.value}.${curriculum.value?.extension ?? 'pdf'}`
  enlaceDescarga.click()
  URL.revokeObjectURL(urlDescarga)
}

async function cargarPostulacion() {
  paginaEspera.value = true
  try {
    const respuestaPostulacion = await get<SendResponseInterface<any>>(
      `api/reclutamiento/postulaciones/${idPostulacion.value}`,
    )

    postulacion.value = respuestaPostulacion.data
    await cargarCurriculum()
  }
  catch (error: any) {
    manejaError(error)
  }
  finally {
    paginaEspera.value = false
  }
}

onMounted(cargarPostulacion)

onBeforeUnmount(() => {
  if (urlVistaPreviaCurriculum.value)
    URL.revokeObjectURL(urlVistaPreviaCurriculum.value)
})

watch(() => form.value.puntaje_fase, (valor) => {
  if (valor === null || String(valor) === '')
    return

  const numero = Number(valor)

  if (numero > 100 || numero < 0) {
    form.value.puntaje_fase = null
    showToastError('El puntaje debe estar entre 0 y 100')
  }
})
</script>

<template>
  <div v-if="postulacion">
    <!-- INFORMACION CANDIDATO -->
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
                class="font-weight-medium"
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
              <span
                v-if="postulacion.vacante"
                class="d-flex align-center gap-1 text-high-emphasis font-weight-medium"
              >
                <VIcon
                  icon="tabler-briefcase"
                  size="16"
                  color="primary"
                />
                {{ postulacion.vacante?.puesto?.nombre || postulacion.vacante?.titulo }}
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
            :codigo="postulacion.id"
            icon="tabler-history"
            tooltip="Bitácora"
            circular
          />

          <VBtn
            v-if="estadosDisponibles.length && can('editar postulaciones', 'Postulacion')"
            color="success"
            prepend-icon="tabler-gavel"
            @click="abrirVeredicto"
          >
            Dar veredicto
          </VBtn>
        </div>
      </VCardText>
    </VCard>

    <VRow>
      <!-- INFORMACIÓN DEL CANDIDATO -->
      <VCol cols="12" md="5">
        <VCard class="mb-6">
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
            <VCardTitle>Información del candidato</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText class="d-flex flex-column gap-4">
            <div class="d-flex align-center gap-3">
              <VIcon
                icon="tabler-id"
                size="20"
                class="text-medium-emphasis"
              />
              <div>
                <div class="text-caption text-medium-emphasis">
                  DPI
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ candidato?.dpi || '—' }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center gap-3">
              <VIcon
                icon="tabler-mail"
                size="20"
                class="text-medium-emphasis"
              />
              <div>
                <div class="text-caption text-medium-emphasis">
                  Correo electrónico
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ candidato?.correo_contacto || '—' }}
                </div>
              </div>
            </div>

            <div class="d-flex align-center gap-3">
              <VIcon
                icon="tabler-phone"
                size="20"
                class="text-medium-emphasis"
              />
              <div>
                <div class="text-caption text-medium-emphasis">
                  Teléfono
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ candidato?.telefono_contacto || '—' }}
                </div>
              </div>
            </div>

            <VRow dense>
              <VCol cols="6">
                <div class="d-flex align-center gap-3">
                  <VIcon
                    icon="tabler-cake"
                    size="20"
                    class="text-medium-emphasis"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Nacimiento
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ formatearFecha(candidato?.fecha_nacimiento) }}
                    </div>
                  </div>
                </div>
              </VCol>

              <VCol cols="6">
                <div class="d-flex align-center gap-3">
                  <VIcon
                    icon="tabler-cash"
                    size="20"
                    class="text-success"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Expectativa salarial
                    </div>
                    <div class="text-body-2 font-weight-semibold text-success">
                      {{ candidato?.expectativa_salarial ? `Q ${candidato.expectativa_salarial}` : '—' }}
                    </div>
                  </div>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <!-- VACANTE -->
        <VCard class="mb-6">
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
            <VCardTitle>Detalle de la plaza</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText>
            <VRow dense>
              <VCol
                cols="12"
                sm="6"
              >
                <div class="text-caption text-medium-emphasis">
                  Puesto
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ postulacion.vacante?.puesto?.nombre || postulacion.vacante?.titulo || '—' }}
                </div>
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <div class="text-caption text-medium-emphasis">
                  Sede
                </div>
                <div class="text-body-1 font-weight-medium d-flex align-center gap-1">
                  <VIcon
                    icon="tabler-map-pin"
                    size="16"
                    class="text-medium-emphasis"
                  />
                  {{ postulacion.vacante?.sede?.nombre || '—' }}
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <!-- CONOCIMIENTOS -->
        <VCard class="mb-6">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="warning"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon
                  icon="tabler-bulb"
                  size="20"
                />
              </VAvatar>
            </template>
            <VCardTitle>Conocimientos y habilidades</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText>
            <div
              v-if="candidato?.conocimientos?.length"
              class="d-flex flex-wrap gap-2"
            >
              <VChip
                v-for="conocimiento in candidato.conocimientos"
                :key="conocimiento.id"
                variant="tonal"
                color="primary"
                size="small"
                label
              >
                <span class="font-weight-medium">{{ conocimiento.descripcion }}</span>
                <span
                  v-if="conocimiento.nivel"
                  class="text-medium-emphasis ms-1"
                >
                  · {{ conocimiento.nivel }}
                </span>
              </VChip>
            </div>
            <div
              v-else
              class="text-body-2 text-disabled"
            >
              Sin conocimientos registrados
            </div>
          </VCardText>
        </VCard>
        <!-- EXPERIENCIA LABORAL -->
        <VCard class="mb-6">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="success"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon
                  icon="tabler-briefcase"
                  size="20"
                />
              </VAvatar>
            </template>
            <VCardTitle>Experiencia laboral</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText>
            <VTimeline
              v-if="candidato?.experiencias?.length"
              side="end"
              align="start"
              truncate-line="both"
              density="compact"
              class="v-timeline-density-compact"
            >
              <VTimelineItem
                v-for="experiencia in candidato.experiencias"
                :key="experiencia.id"
                dot-color="primary"
                size="x-small"
              >
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-semibold text-high-emphasis">
                    {{ experiencia.puesto }}
                  </span>
                  <span class="text-body-2 font-weight-medium text-primary">
                    {{ experiencia.empresa }}
                  </span>
                  <span class="text-caption text-medium-emphasis mt-1">
                    {{ formatearPeriodo(experiencia.fecha_inicio) }} — {{ experiencia.fecha_fin ? formatearPeriodo(experiencia.fecha_fin) : 'Actualidad' }}
                  </span>
                </div>
              </VTimelineItem>
            </VTimeline>
            <div
              v-else
              class="text-body-2 text-disabled"
            >
              Sin experiencia laboral registrada
            </div>
          </VCardText>
        </VCard>
        <!-- FORMACIÓN ACADÉMICA -->
        <VCard>
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="secondary"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon
                  icon="tabler-school"
                  size="20"
                />
              </VAvatar>
            </template>
            <VCardTitle>Formación académica</VCardTitle>
          </VCardItem>

          <VDivider />

          <VCardText>
            <VTimeline
              v-if="candidato?.formaciones?.length"
              side="end"
              align="start"
              truncate-line="both"
              density="compact"
              class="v-timeline-density-compact"
            >
              <VTimelineItem
                v-for="formacion in candidato.formaciones"
                :key="formacion.id"
                dot-color="secondary"
                size="x-small"
              >
                <div class="d-flex flex-column">
                  <span class="text-body-1 font-weight-semibold text-high-emphasis">
                    {{ formacion.titulo_carrera || formacion.nombre }}
                  </span>
                  <span
                    v-if="formacion.titulo_carrera && formacion.nombre"
                    class="text-body-2 text-medium-emphasis"
                  >
                    {{ formacion.nombre }}
                  </span>
                  <span class="text-caption text-medium-emphasis mt-1">
                    {{ formatearPeriodo(formacion.fecha_inicio) }} — {{ formacion.fecha_fin ? formatearPeriodo(formacion.fecha_fin) : 'Actualidad' }}
                  </span>
                </div>
              </VTimelineItem>
            </VTimeline>
            <div
              v-else
              class="text-body-2 text-disabled"
            >
              Sin formación académica registrada
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- VISUALIZACIÓN DEL CURRÍCULUM VITAE -->
      <VCol cols="12" md="7">
        <VCard class="cv-sticky-card">
          <VCardItem>
            <template #prepend>
              <VAvatar
                color="error"
                variant="tonal"
                size="36"
                rounded
              >
                <VIcon
                  icon="tabler-file-text"
                  size="20"
                />
              </VAvatar>
            </template>
            <VCardTitle>Currículum Vitae</VCardTitle>
            <VCardSubtitle v-if="curriculum?.extension">
              Archivo {{ curriculum.extension.toUpperCase() }}
            </VCardSubtitle>

            <template #append>
              <VBtn
                v-if="archivoCurriculum"
                prepend-icon="tabler-download"
                color="primary"
                variant="elevated"
                size="small"
                @click="descargarCurriculum"
              >
                Descargar CV
              </VBtn>
            </template>
          </VCardItem>

          <VDivider />

          <VCardText>
            <div
              v-if="cargandoCurriculum"
              class="d-flex flex-column align-center justify-center py-16 gap-3"
            >
              <VProgressCircular
                indeterminate
                color="primary"
                size="40"
              />
              <span class="text-body-2 text-medium-emphasis">Cargando documento...</span>
            </div>

            <div
              v-else-if="urlVistaPreviaCurriculum"
              class="rounded overflow-hidden border"
            >
              <iframe
                :src="urlVistaPreviaCurriculum"
                title="Vista previa del currículum"
                class="d-block w-100"
                style="block-size: 78vh; border: 0;"
              />
            </div>

            <div
              v-else-if="archivoCurriculum"
              class="d-flex flex-column align-center justify-center text-center py-16 px-4 rounded border border-dashed"
            >
              <VAvatar
                color="info"
                variant="tonal"
                size="64"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-file-download"
                  size="32"
                />
              </VAvatar>
              <h6 class="text-h6 mb-1">
                Vista previa no disponible
              </h6>
              <p class="text-body-2 text-medium-emphasis mb-4" style="max-inline-size: 360px;">
                El archivo tiene formato <strong>.{{ curriculum?.extension }}</strong>, por lo que no puede visualizarse directamente en el navegador.
              </p>
              <VBtn
                prepend-icon="tabler-download"
                @click="descargarCurriculum"
              >
                Descargar archivo
              </VBtn>
            </div>

            <div
              v-else
              class="d-flex flex-column align-center justify-center text-center py-16 px-4 rounded border border-dashed"
            >
              <VAvatar
                color="secondary"
                variant="tonal"
                size="64"
                class="mb-4"
              >
                <VIcon
                  icon="tabler-file-off"
                  size="32"
                />
              </VAvatar>
              <h6 class="text-h6 mb-1">
                Sin currículum adjunto
              </h6>
              <p class="text-body-2 text-medium-emphasis mb-0">
                El candidato no cargó ningún documento para esta postulación.
              </p>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <ModalBasico
      v-model:mostrar-modal="dialogVeredicto"
      titulo="Dar veredicto"
      max-width="500"
    >
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <AppSelect
            v-model="form.estado_id"
            label="Siguiente paso"
            :items="estadosDisponibles"
            item-title="nombre"
            item-value="id"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="form.puntaje_fase"
            label="Puntaje de esta fase"
            type="number"
            min="0"
            max="100"
          />
        </VCol>
        <VCol cols="12">
          <AppTextarea
            v-model="form.comentario"
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
          @click="dialogVeredicto = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="success"
          :loading="guardando"
          :disabled="!form.estado_id || !form.comentario"
          @click="darVeredicto"
        >
          Confirmar
        </VBtn>
      </div>
    </ModalBasico>
  </div>
</template>

<style scoped>
@media (min-width: 960px) {
  .cv-sticky-card {
    position: sticky;
    inset-block-start: 88px;
  }
}
</style>

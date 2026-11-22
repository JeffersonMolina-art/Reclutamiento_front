<script setup lang="ts">
export interface EstadoCv {
  tiene_cv: boolean
  vigente: boolean
  requiere_actualizar: boolean
  motivo?: string | null
  subido_el?: string
  vence_el?: string
  extension?: string
  tamano?: number
}

const cv = defineModel<EstadoCv | null>({ required: true })

const { peticion, token } = useCandidatoSesion()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()
const mensajeError = (error: any, base: string) => {
  const errores = error?.data?.errors
  const primero = errores ? (Object.values(errores)[0] as string[] | undefined)?.[0] : null

  return primero ?? error?.data?.message ?? base
}

const sesionExpirada = async (error: any) => {
  const estado = error?.statusCode ?? error?.response?.status

  if (estado !== 401 && estado !== 403)
    return false

  token.value = null
  await navigateTo('/reclutamiento/login')

  return true
}

const subiendoCv = ref(false)
const archivoCv = ref<File[]>([])
const claveInputCv = ref(0)

const tamanoVisible = (bytes?: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : ''

const archivoCvSeleccionado = computed(() => {
  const seleccion = archivoCv.value

  return Array.isArray(seleccion)
    ? seleccion[0] ?? null
    : seleccion ?? null
})

async function subirCv() {
  const archivo = archivoCv.value[0]

  if (!(archivo instanceof File) || subiendoCv.value)
    return

  const cuerpo = new FormData()

  cuerpo.append('cv', archivo)
  subiendoCv.value = true

  try {
    const respuesta = await peticion<{ message: string; data: EstadoCv }>('/api/portal/perfil/cv', {
      method: 'POST',
      body: cuerpo,
    })

    cv.value = respuesta.data
    archivoCv.value = []
    claveInputCv.value++
    showToastSuccess(respuesta.message)
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudo cargar el currículum'))
  }
  finally {
    subiendoCv.value = false
  }
}

async function descargarCv() {
  try {
    const blob = await peticion<Blob>('/api/portal/perfil/cv/descargar', { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = `curriculum.${cv.value?.extension ?? 'pdf'}`
    enlace.click()
    URL.revokeObjectURL(url)
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError('No se pudo descargar el currículum')
  }
}

async function eliminarCv() {
  const confirmado = await preguntaEliminar(
    '¿Eliminar tu currículum?',
    'Para volver a postularte, tendrás que subir un currículum nuevo.',
  )

  if (!confirmado)
    return

  try {
    await peticion('/api/portal/perfil/cv', { method: 'DELETE' })

    cv.value = {
      tiene_cv: false,
      vigente: false,
      requiere_actualizar: true,
      motivo: 'Aún no has subido tu CV.',
    }

    showToastSuccess('Currículum eliminado.')
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError('No se pudo eliminar el currículum.')
  }
}
</script>

<template>
  <PerfilTarjeta>
    <div class="d-flex align-center ga-3 mb-4">
      <VAvatar
        color="primary"
        variant="tonal"
        rounded="lg"
        size="44"
      >
        <VIcon
          icon="tabler-file-cv"
          size="24"
        />
      </VAvatar>

      <div>
        <h2 class="perfil-seccion mb-0">
          Currículum (CV)
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Adjunta un PDF, DOC o DOCX de hasta 5 MB.
        </p>
      </div>
    </div>

    <VAlert
      v-if="cv?.requiere_actualizar"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      {{ cv.motivo }} Lo necesitas para poder postularte.
    </VAlert>

    <div
      v-if="cv?.tiene_cv"
      class="perfil-cv-actual"
    >
      <VIcon
        icon="tabler-file-check"
        size="28"
        aria-hidden="true"
      />

      <div>
        <strong>
          CV cargado ({{ cv.extension?.toUpperCase() }}, {{ tamanoVisible(cv.tamano) }})
        </strong>
        <small v-if="cv.vence_el">Vigente hasta {{ cv.vence_el }}</small>
      </div>

      <VSpacer />

      <VBtn
        variant="tonal"
        prepend-icon="tabler-download"
        @click="descargarCv"
      >
        Descargar
      </VBtn>

      <VBtn
        variant="text"
        color="error"
        icon="tabler-trash"
        aria-label="Eliminar currículum"
        @click="eliminarCv"
      />
    </div>

    <div class="cv-carga mt-4">
      <InputFile
        :key="claveInputCv"
        v-model:archivos="archivoCv"
        name="cv"
        accept=".pdf,.doc,.docx"
        :max-size-mb="5"
        :lectura="subiendoCv"
      />

      <VDivider />

      <div class="d-flex justify-end">
        <VBtn
          color="#123e66"
          variant="flat"
          prepend-icon="tabler-device-floppy"
          :loading="subiendoCv"
          :disabled="!archivoCvSeleccionado || subiendoCv"
          @click="subirCv"
        >
          Guardar CV
        </VBtn>
      </div>
    </div>
  </PerfilTarjeta>
</template>

<style scoped>
.perfil-seccion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.0625rem;
  font-weight: 700;
}

.perfil-seccion::before {
  content: '';
  display: inline-block;
  inline-size: 3.5px;
  block-size: 1.05rem;
  border-radius: 99px;
  background: var(--portal-verde);
}

.perfil-cv-actual {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-block-end: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--portal-borde);
  border-radius: 0.75rem;
  background: rgba(var(--v-theme-on-surface), 0.04);
  flex-wrap: wrap;
}

.perfil-cv-actual small {
  display: block;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
</style>

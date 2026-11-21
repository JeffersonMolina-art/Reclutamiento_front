<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'
definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

useSeoMeta({ title: 'Mi perfil y currículum' })

type Recurso = 'conocimientos' | 'experiencias' | 'formaciones'

interface EstadoCv {
  tiene_cv: boolean
  vigente: boolean
  requiere_actualizar: boolean
  motivo?: string | null
  subido_el?: string
  vence_el?: string
  extension?: string
  tamano?: number
}

const { peticion, estaAutenticado, token } = useCandidatoSesion()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()

const cargando = ref(true)
const guardandoDatos = ref(false)
const guardandoItem = ref(false)
const subiendoCv = ref(false)
const errorCarga = ref('')

const refFormDatos = ref<VForm>()
const refFormItem = ref<VForm>()
const archivoCv = ref<File[]>([])
const claveInputCv = ref(0)

const datos = ref({
  dpi: '',
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  correo_contacto: '',
  telefono_contacto: '',
  fecha_nacimiento: '',
  expectativa_salarial: 0 as number | string,
})

const conocimientos = ref<any[]>([])
const experiencias = ref<any[]>([])
const formaciones = ref<any[]>([])
const cv = ref<EstadoCv | null>(null)

const niveles = ['Básico', 'Intermedio', 'Avanzado', 'Experto']

const titulos: Record<Recurso, string> = {
  conocimientos: 'conocimiento',
  experiencias: 'experiencia laboral',
  formaciones: 'formación académica',
}

const formatoFecha = new Intl.DateTimeFormat('es-GT', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const fechaVisible = (f?: string | null) => f ? formatoFecha.format(new Date(f.slice(0, 10))) : ''
const periodo = (item: { fecha_inicio: string, fecha_fin?: string | null }) =>
  `${fechaVisible(item.fecha_inicio)} – ${item.fecha_fin ? fechaVisible(item.fecha_fin) : 'Actualidad'}`

const soloLetras = (v: string) => !v || /^[\p{L}][\p{L} .'-]*$/u.test(v) || 'Solo se permiten letras'
const telefonoValido = (v: string) => /^\d{8,11}$/.test(v ?? '') || 'Debe tener entre 8 y 11 dígitos'
const salarioValido = (v: string | number) => (v !== '' && Number(v) >= 0) || 'Ingresa un monto válido'
const hoy = new Date().toISOString().slice(0, 10)

watch(() => datos.value.telefono_contacto, v => {
  const limpio = (v ?? '').replace(/\D/g, '').slice(0, 11)

  if (limpio !== v)
    datos.value.telefono_contacto = limpio
})

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

async function cargar() {
  cargando.value = true
  errorCarga.value = ''

  try {
    const { data } = await peticion<{ data: any }>('/api/portal/perfil')

    datos.value = { ...datos.value, ...data.datos, segundo_nombre: data.datos.segundo_nombre ?? '', tercer_nombre: data.datos.tercer_nombre ?? '', segundo_apellido: data.datos.segundo_apellido ?? '' }
    conocimientos.value = data.conocimientos
    experiencias.value = data.experiencias
    formaciones.value = data.formaciones
    cv.value = data.cv
  }
  catch (error) {
    if (await sesionExpirada(error))
      return

    errorCarga.value = 'No se pudo cargar tu perfil.'
  }
  finally {
    cargando.value = false
  }
}

async function guardarDatos() {
  const { valid } = await refFormDatos.value!.validate()

  if (!valid || guardandoDatos.value)
    return

  guardandoDatos.value = true

  try {
    const { dpi: _dpi, ...cuerpo } = datos.value

    const respuesta = await peticion<{ message: string }>('/api/portal/perfil', {
      method: 'PUT',
      body: {
        ...cuerpo,
        segundo_nombre: cuerpo.segundo_nombre || null,
        tercer_nombre: cuerpo.tercer_nombre || null,
        segundo_apellido: cuerpo.segundo_apellido || null,
      },
    })

    showToastSuccess(respuesta.message)
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudieron guardar los datos'))
  }
  finally {
    guardandoDatos.value = false
  }
}

// CONOCIMIENTOS, EXPERIENCIAS, FORMACIONES
const dialogo = ref(false)
const recurso = ref<Recurso>('conocimientos')
const itemId = ref<number | null>(null)
const actual = ref(false)
const form = ref<Record<string, any>>({})

const lista = (recurso: Recurso) => ({ conocimientos, experiencias, formaciones })[recurso]

function abrirDialogo(tipoRecurso: Recurso, item?: any) {
  recurso.value = tipoRecurso
  itemId.value = item?.id ?? null
  form.value = item ? { ...item } : {}

  if (item) {
    delete form.value.id
    form.value.fecha_inicio = item.fecha_inicio?.slice(0, 10)
    form.value.fecha_fin = item.fecha_fin?.slice(0, 10) ?? null
  }

  actual.value = !!item && tipoRecurso !== 'conocimientos' && !item.fecha_fin
  dialogo.value = true
}

watch(actual, anterior => {
  if (anterior)
    form.value.fecha_fin = null
})

async function guardarItem() {
  const { valid } = await refFormItem.value!.validate()

  if (!valid || guardandoItem.value)
    return

  guardandoItem.value = true

  try {
    const base = `/api/portal/perfil/${recurso.value}`
    const cuerpo = { ...form.value, fecha_fin: actual.value ? null : (form.value.fecha_fin || null) }

    const respuesta = await peticion<{ message: string }>(itemId.value ? `${base}/${itemId.value}` : base, {
      method: itemId.value ? 'PUT' : 'POST',
      body: cuerpo,
    })

    showToastSuccess(respuesta.message)
    dialogo.value = false
    await recargarLista(recurso.value)
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudo guardar el registro'))
  }
  finally {
    guardandoItem.value = false
  }
}

async function recargarLista(recurso: Recurso) {
  const { data } = await peticion<{ data: any[] }>(`/api/portal/perfil/${recurso}`)

  lista(recurso).value = data
}

async function eliminarItem(recurso: Recurso, item: any) {
  const preguntas: Record<Recurso, string> = {
    formaciones: '¿Eliminar esta formación académica?',
    experiencias: '¿Eliminar esta experiencia laboral?',
    conocimientos: '¿Eliminar este conocimiento o habilidad?',
  }

  const confirmado = await preguntaEliminar(
    preguntas[recurso],
    'El registro se quitará de tu perfil.',
  )

  if (!confirmado)
    return

  try {
    await peticion(`/api/portal/perfil/${recurso}/${item.id}`, { method: 'DELETE' })
    lista(recurso).value = lista(recurso).value.filter(i => i.id !== item.id)
    showToastSuccess('Registro eliminado.')
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudo eliminar el registro'))
  }
}

// CURRÍCULUM
async function subirCv() {
  const archivo = archivoCv.value[0]

  if (!(archivo instanceof File) || subiendoCv.value)
    return

  const cuerpo = new FormData()

  cuerpo.append('cv', archivo)
  subiendoCv.value = true

  try {
    const respuesta = await peticion<{ message: string, data: EstadoCv }>('/api/portal/perfil/cv', {
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
const tamanoVisible = (bytes?: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : ''
const archivoCvSeleccionado = computed(() => {
  const seleccion = archivoCv.value

  return Array.isArray(seleccion)
    ? seleccion[0] ?? null
    : seleccion ?? null
})

const urlVistaPreviaCv = ref<string | null>(null)

watch(archivoCvSeleccionado, (archivo, _anterior, limpiar) => {
  urlVistaPreviaCv.value = null

  if (!archivo || !/\.pdf$/i.test(archivo.name))
    return

  const url = URL.createObjectURL(archivo)

  urlVistaPreviaCv.value = url
  limpiar(() => URL.revokeObjectURL(url))
})
onMounted(() => {
  if (!estaAutenticado.value)
    return navigateTo('/reclutamiento/login')

  return cargar()
})
</script>

<template>
  <div class="perfil-pagina">
    <VContainer class="perfil-contenedor">
      <header class="perfil-encabezado">
        <h1>Mi perfil y currículum</h1>
        <p>Mantén tu información al día: se usa automáticamente en todas tus postulaciones.</p>
      </header>

      <VProgressLinear v-if="cargando" indeterminate color="#123e66" />

      <VAlert v-else-if="errorCarga" type="error" variant="tonal" role="alert">
        {{ errorCarga }}
        <template #append>
          <VBtn variant="text" @click="cargar">
            Reintentar
          </VBtn>
        </template>
      </VAlert>

      <template v-else>
        <!-- Currículum -->
        <VCard class="perfil-card" elevation="0">
          <div class="d-flex align-center ga-3 mb-4">
            <VAvatar color="primary" variant="tonal" rounded="lg" size="44">
              <VIcon icon="tabler-file-cv" size="24" />
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

          <div v-if="cv?.tiene_cv" class="perfil-cv-actual">
            <VIcon icon="tabler-file-check" size="28" aria-hidden="true" />

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
        </VCard>
        <!-- Datos personales -->
        <VCard class="perfil-card" elevation="0">
          <h2 class="perfil-seccion">
            Datos personales
          </h2>

          <VForm ref="refFormDatos" :disabled="guardandoDatos" @submit.prevent="guardarDatos">
            <VRow>
              <VCol cols="12" md="4">
                <AppTextField v-model="datos.primer_nombre" :rules="[requiredValidator, soloLetras]" label="Primer nombre" />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField v-model="datos.segundo_nombre" :rules="[soloLetras]" label="Segundo nombre (opcional)" />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField v-model="datos.tercer_nombre" :rules="[soloLetras]" label="Tercer nombre (opcional)" />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField v-model="datos.primer_apellido" :rules="[requiredValidator, soloLetras]" label="Primer apellido" />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField v-model="datos.segundo_apellido" :rules="[soloLetras]" label="Segundo apellido (opcional)" />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField v-model="datos.dpi" label="DPI" readonly />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model="datos.fecha_nacimiento"
                  :rules="[requiredValidator]"
                  label="Fecha de nacimiento"
                  type="date"
                />
              </VCol>
              <VCol cols="12" md="4">
                <AppTextField
                  v-model="datos.expectativa_salarial"
                  :rules="[salarioValido]"
                  label="Expectativa salarial (Q)"
                  type="number"
                  min="0"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="datos.correo_contacto"
                  :rules="[requiredValidator, emailValidator]"
                  label="Correo de contacto"
                  type="email"
                />
              </VCol>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="datos.telefono_contacto"
                  :rules="[requiredValidator, telefonoValido]"
                  label="Teléfono"
                  inputmode="numeric"
                  maxlength="11"
                />
              </VCol>
            </VRow>

            <VBtn
              type="submit"
              color="#123e66"
              class="mt-2"
              :loading="guardandoDatos"
              :disabled="guardandoDatos"
            >
              Guardar datos
            </VBtn>
          </VForm>
        </VCard>
        <!-- Formación académica -->
        <VCard class="trayectoria-card trayectoria-card--formacion" elevation="0">
          <header class="trayectoria-cabecera">
            <div class="trayectoria-titulo">
      <span class="trayectoria-icono">
        <VIcon icon="tabler-school" size="24" />
      </span>
              <h2>Formación académica</h2>
            </div>

            <VBtn
              class="trayectoria-agregar"
              variant="tonal"
              prepend-icon="tabler-plus"
              aria-label="Agregar formación académica"
              @click="abrirDialogo('formaciones')"
            >
              Agregar
            </VBtn>
          </header>

          <div v-if="!formaciones.length" class="trayectoria-vacio">
            <VIcon icon="tabler-book-2" size="22" />
            <p>Agrega tus estudios, títulos o carreras.</p>
          </div>

          <ul v-else class="trayectoria-lista">
            <li v-for="item in formaciones" :key="item.id" class="trayectoria-fila">
              <div class="trayectoria-datos">
                <strong>{{ item.titulo_carrera || item.nombre }}</strong>
                <span v-if="item.titulo_carrera">{{ item.nombre }}</span>
                <small v-if="item.fecha_inicio" class="trayectoria-periodo">
                  <VIcon icon="tabler-calendar" size="15" />
                  {{ periodo(item) }}
                </small>
              </div>

              <div class="trayectoria-acciones">
                <VBtn
                  icon="tabler-edit"
                  variant="text"
                  size="small"
                  :aria-label="'Editar ' + (item.titulo_carrera || item.nombre)"
                  @click="abrirDialogo('formaciones', item)"
                />
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  size="small"
                  color="error"
                  :aria-label="'Eliminar ' + (item.titulo_carrera || item.nombre)"
                  @click="eliminarItem('formaciones', item)"
                />
              </div>
            </li>
          </ul>
        </VCard>
        <!-- Experiencia laboral -->
        <VCard class="trayectoria-card trayectoria-card--experiencia" elevation="0">
          <header class="trayectoria-cabecera">
            <div class="trayectoria-titulo">
      <span class="trayectoria-icono">
        <VIcon icon="tabler-briefcase" size="24" />
      </span>
              <h2>Experiencia laboral</h2>
            </div>

            <VBtn
              class="trayectoria-agregar"
              variant="tonal"
              prepend-icon="tabler-plus"
              aria-label="Agregar experiencia laboral"
              @click="abrirDialogo('experiencias')"
            >
              Agregar
            </VBtn>
          </header>

          <div v-if="!experiencias.length" class="trayectoria-vacio">
            <VIcon icon="tabler-building" size="22" />
            <p>Agrega los puestos que has desempeñado.</p>
          </div>

          <ul v-else class="trayectoria-lista">
            <li v-for="item in experiencias" :key="item.id" class="trayectoria-fila">
              <div class="trayectoria-datos">
                <strong>{{ item.puesto || item.empresa }}</strong>
                <span v-if="item.puesto">{{ item.empresa }}</span>
                <small v-if="item.fecha_inicio" class="trayectoria-periodo">
                  <VIcon icon="tabler-calendar" size="15" />
                  {{ periodo(item) }}
                </small>
              </div>

              <div class="trayectoria-acciones">
                <VBtn
                  icon="tabler-edit"
                  variant="text"
                  size="small"
                  :aria-label="'Editar ' + (item.puesto || item.empresa)"
                  @click="abrirDialogo('experiencias', item)"
                />
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  size="small"
                  color="error"
                  :aria-label="'Eliminar ' + (item.puesto || item.empresa)"
                  @click="eliminarItem('experiencias', item)"
                />
              </div>
            </li>
          </ul>
        </VCard>
        <!-- Conocimientos y habilidades -->
        <VCard class="trayectoria-card trayectoria-card--habilidades" elevation="0">
          <header class="trayectoria-cabecera">
            <div class="trayectoria-titulo">
      <span class="trayectoria-icono">
        <VIcon icon="tabler-bulb" size="24" />
      </span>
              <h2>Conocimientos y habilidades</h2>
            </div>

            <VBtn
              class="trayectoria-agregar"
              variant="tonal"
              prepend-icon="tabler-plus"
              aria-label="Agregar conocimiento o habilidad"
              @click="abrirDialogo('conocimientos')"
            >
              Agregar
            </VBtn>
          </header>

          <div v-if="!conocimientos.length" class="trayectoria-vacio">
            <VIcon icon="tabler-tools" size="22" />
            <p>Agrega habilidades, herramientas o conocimientos que dominas.</p>
          </div>

          <ul v-else class="trayectoria-lista">
            <li v-for="item in conocimientos" :key="item.id" class="trayectoria-fila">
              <div class="trayectoria-datos">
                <strong>{{ item.descripcion }}</strong>
                <VChip
                  v-if="item.nivel"
                  class="trayectoria-nivel"
                  size="small"
                  variant="tonal"
                >
                  Nivel {{ item.nivel }}
                </VChip>
              </div>

              <div class="trayectoria-acciones">
                <VBtn
                  icon="tabler-edit"
                  variant="text"
                  size="small"
                  :aria-label="'Editar ' + item.descripcion"
                  @click="abrirDialogo('conocimientos', item)"
                />
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  size="small"
                  color="error"
                  :aria-label="'Eliminar ' + item.descripcion"
                  @click="eliminarItem('conocimientos', item)"
                />
              </div>
            </li>
          </ul>
        </VCard>
      </template>
    </VContainer>

    <ModalBasico
      v-model:mostrar-modal="dialogo"
      :titulo="(itemId ? 'Editar ' : 'Agregar ') + titulos[recurso]"
      :aria-label="(itemId ? 'Editar ' : 'Agregar ') + titulos[recurso]"
      :card-props="{ rounded: 'xl' }"
      :persistent="guardandoItem"
      max-width="560"
      scrollable
    >
      <VForm
        ref="refFormItem"
        class="trayectoria-formulario"
        :disabled="guardandoItem"
        @submit.prevent="guardarItem"
      >
        <VRow>
          <template v-if="recurso === 'conocimientos'">
            <VCol cols="12">
              <AppTextField
                v-model="form.descripcion"
                :rules="[requiredValidator]"
                label="Conocimiento o habilidad"
                placeholder="Ej. Microsoft Excel"
                prepend-inner-icon="tabler-bulb"
                maxlength="255"
              />
            </VCol>

            <VCol cols="12">
              <AppSelect
                v-model="form.nivel"
                :items="niveles"
                label="Nivel (opcional)"
                clearable
              />
            </VCol>
          </template>

          <template v-else>
            <VCol cols="12">
              <AppTextField
                v-if="recurso === 'experiencias'"
                key="empresa"
                v-model="form.empresa"
                :rules="[requiredValidator]"
                label="Empresa"
                prepend-inner-icon="tabler-building"
                maxlength="255"
              />
              <AppTextField
                v-else
                key="institucion"
                v-model="form.nombre"
                :rules="[requiredValidator]"
                label="Institución"
                prepend-inner-icon="tabler-school"
                maxlength="255"
              />
            </VCol>

            <VCol cols="12">
              <AppTextField
                v-if="recurso === 'experiencias'"
                key="puesto"
                v-model="form.puesto"
                label="Puesto (opcional)"
                maxlength="45"
              />
              <AppTextField
                v-else
                key="carrera"
                v-model="form.titulo_carrera"
                label="Título o carrera (opcional)"
                maxlength="255"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.fecha_inicio"
                :rules="[requiredValidator]"
                label="Fecha de inicio"
                type="date"
                :max="hoy"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <AppTextField
                v-model="form.fecha_fin"
                label="Fecha de fin"
                type="date"
                :min="form.fecha_inicio"
                :max="hoy"
                :disabled="actual"
              />
            </VCol>

            <VCol cols="12">
              <div class="trayectoria-actual">
                <VCheckbox
                  v-model="actual"
                  color="primary"
                  density="compact"
                  :label="recurso === 'experiencias'
                ? 'Trabajo aquí actualmente'
                : 'Estudio aquí actualmente'"
                  hide-details
                />
              </div>
            </VCol>
          </template>
        </VRow>

        <div class="trayectoria-formulario-acciones">
          <VBtn
            type="button"
            variant="text"
            :disabled="guardandoItem"
            @click="dialogo = false"
          >
            Cancelar
          </VBtn>

          <VBtn
            type="submit"
            color="primary"
            variant="flat"
            prepend-icon="tabler-device-floppy"
            :loading="guardandoItem"
            :disabled="guardandoItem"
          >
            Guardar
          </VBtn>
        </div>
      </VForm>
    </ModalBasico>
  </div>
</template>

<style scoped>
.perfil-pagina {
  --portal-verde: #80b94e;
  --portal-borde: rgba(var(--v-border-color), var(--v-border-opacity));

  min-block-size: 80vh;
  padding-block: clamp(5rem, 7vw, 6.25rem) 4rem;
  background: rgb(var(--v-theme-background));
}

.perfil-contenedor {
  max-inline-size: 56rem;
}

.perfil-encabezado {
  margin-block-end: 1.75rem;
  padding-block-end: 1rem;
  border-block-end: 3px solid var(--portal-verde);
}

.perfil-encabezado h1 {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: clamp(1.6rem, 3.5vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.perfil-encabezado p {
  margin: 0.4rem 0 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.975rem;
}

.perfil-card {
  margin-block-end: 1.25rem;
  padding: 1.5rem;
  border: 1px solid var(--portal-borde);
  border-radius: 0.875rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.08);
}

.perfil-seccion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.15rem;
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

.perfil-seccion-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-block-end: 1.15rem;
}

.perfil-seccion-cabecera .perfil-seccion {
  margin-block-end: 0;
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

.perfil-cv-subir {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.perfil-cv-subir .v-input {
  flex: 1 1 18rem;
}

.perfil-lista {
  display: grid;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.perfil-lista li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--portal-borde);
  border-radius: 0.75rem;
  background: rgba(var(--v-theme-on-surface), 0.02);
  transition: background-color 0.15s ease;
}

.perfil-lista li:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.perfil-lista strong {
  display: block;
  color: rgb(var(--v-theme-on-surface));
}

.perfil-lista span,
.perfil-lista small {
  display: block;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.perfil-acciones {
  display: flex;
  flex-shrink: 0;
  gap: 0.35rem;
}

.perfil-vacio {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.trayectoria-card {
  --trayectoria-acento: var(--v-theme-primary);

  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 18px;
}

.trayectoria-card--experiencia {
  --trayectoria-acento: var(--v-theme-success);
}

.trayectoria-card--habilidades {
  --trayectoria-acento: var(--v-theme-info);
}

.trayectoria-cabecera,
.trayectoria-titulo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trayectoria-cabecera {
  flex-wrap: wrap;
  justify-content: space-between;
  margin-block-end: 1rem;
}

.trayectoria-titulo h2 {
  margin: 0;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 700;
  line-height: 1.3;
}

.trayectoria-icono {
  display: grid;
  flex: 0 0 44px;
  place-items: center;
  block-size: 44px;
  border-radius: 12px;
  background: rgba(var(--trayectoria-acento), 0.11);
  color: rgb(var(--trayectoria-acento));
}

.trayectoria-agregar {
  color: rgb(var(--trayectoria-acento));
}

.trayectoria-lista {
  display: grid;
  gap: 0.65rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.trayectoria-fila {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.trayectoria-fila:hover,
.trayectoria-fila:focus-within {
  border-color: rgba(var(--trayectoria-acento), 0.3);
  background: rgba(var(--trayectoria-acento), 0.045);
}

.trayectoria-datos {
  display: grid;
  gap: 0.25rem;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}

.trayectoria-datos > span,
.trayectoria-periodo,
.trayectoria-vacio {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.trayectoria-periodo {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.trayectoria-nivel {
  justify-self: start;
  margin-block-start: 0.25rem;
  color: rgb(var(--trayectoria-acento));
}

.trayectoria-acciones {
  display: flex;
  flex: 0 0 auto;
  gap: 0.15rem;
}

.trayectoria-vacio {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px dashed rgba(var(--trayectoria-acento), 0.35);
  border-radius: 12px;
  background: rgba(var(--trayectoria-acento), 0.04);
}

.trayectoria-vacio p {
  margin: 0;
}

.trayectoria-formulario {
  padding-block-start: 0.25rem;
}

.trayectoria-actual {
  padding-inline: 0.75rem;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.06);
}

.trayectoria-formulario-acciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-block-start: 1rem;
  margin-block-start: 1.25rem;
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>

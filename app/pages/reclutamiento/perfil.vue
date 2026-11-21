<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'
import type { Ref } from 'vue'
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
const { showToastSuccess, showToastError } = useToast()

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

// ---- Conocimientos, experiencias y formaciones ----
const dialogo = ref(false)
const recurso = ref<Recurso>('conocimientos')
const itemId = ref<number | null>(null)
const actual = ref(false)
const form = ref<Record<string, any>>({})

const lista = (r: Recurso) => ({ conocimientos, experiencias, formaciones })[r]

function abrirDialogo(r: Recurso, item?: any) {
  recurso.value = r
  itemId.value = item?.id ?? null
  form.value = item ? { ...item } : {}

  if (item) {
    delete form.value.id
    form.value.fecha_inicio = item.fecha_inicio?.slice(0, 10)
    form.value.fecha_fin = item.fecha_fin?.slice(0, 10) ?? null
  }

  actual.value = !!item && r !== 'conocimientos' && !item.fecha_fin
  dialogo.value = true
}

watch(actual, v => {
  if (v)
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

async function recargarLista(r: Recurso) {
  const { data } = await peticion<{ data: any[] }>(`/api/portal/perfil/${r}`)

  lista(r).value = data
}

async function eliminarItem(r: Recurso, item: any) {
  if (!window.confirm(`¿Eliminar este registro de ${titulos[r]}?`))
    return

  try {
    await peticion(`/api/portal/perfil/${r}/${item.id}`, { method: 'DELETE' })
    lista(r).value = lista(r).value.filter(i => i.id !== item.id)
    showToastSuccess('Registro eliminado.')
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudo eliminar el registro'))
  }
}

// ---- Currículum ----
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
  if (!window.confirm('¿Eliminar tu currículum? No podrás postularte hasta subir uno nuevo.'))
    return

  try {
    await peticion('/api/portal/perfil/cv', { method: 'DELETE' })
    cv.value = { tiene_cv: false, vigente: false, requiere_actualizar: true, motivo: 'Aún no has subido tu CV.' }
    showToastSuccess('Currículum eliminado.')
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError('No se pudo eliminar el currículum')
  }
}

const tamanoVisible = (bytes?: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : ''


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
          <h2 class="perfil-seccion">
            Currículum (CV)
          </h2>

          <VAlert
            v-if="cv?.requiere_actualizar"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            {{ cv.motivo }} Lo necesitas para poder postularte.
          </VAlert>

          <div v-if="cv?.tiene_cv" class="perfil-cv-actual">
            <VIcon icon="tabler-file-cv" size="32" aria-hidden="true" />
            <div>
              <strong>CV cargado ({{ cv.extension?.toUpperCase() }}, {{ tamanoVisible(cv.tamano) }})</strong>
              <small>Vigente hasta {{ cv.vence_el }}</small>
            </div>
            <VSpacer />
            <VBtn variant="tonal" prepend-icon="tabler-download" @click="descargarCv">
              Descargar
            </VBtn>
            <VBtn variant="text" color="error" icon="tabler-trash" aria-label="Eliminar currículum" @click="eliminarCv" />
          </div>

          <div class="perfil-cv-subir">
            <InputFile
              :key="claveInputCv"
              v-model:archivos="archivoCv"
              name="cv"
              accept=".pdf,.doc,.docx"
              :max-size-mb="5"
              :lectura="subiendoCv"
            />
            <VBtn
              color="#123e66"
              :loading="subiendoCv"
              :disabled="!archivoCv?.length || subiendoCv"
              @click="subirCv"
            >
              Guardar CV
            </VBtn>
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

        <!-- Formación -->
        <VCard class="perfil-card" elevation="0">
          <div class="perfil-seccion-cabecera">
            <h2 class="perfil-seccion">
              Formación académica
            </h2>
            <VBtn variant="tonal" prepend-icon="tabler-plus" @click="abrirDialogo('formaciones')">
              Agregar
            </VBtn>
          </div>

          <p v-if="!formaciones.length" class="perfil-vacio">
            Aún no has agregado formación académica.
          </p>

          <ul v-else class="perfil-lista">
            <li v-for="item in formaciones" :key="item.id">
              <div>
                <strong>{{ item.titulo_carrera || item.nombre }}</strong>
                <span v-if="item.titulo_carrera">{{ item.nombre }}</span>
                <small>{{ periodo(item) }}</small>
              </div>
              <div class="perfil-acciones">
                <VBtn icon="tabler-edit" variant="text" size="small" aria-label="Editar" @click="abrirDialogo('formaciones', item)" />
                <VBtn icon="tabler-trash" variant="text" size="small" color="error" aria-label="Eliminar" @click="eliminarItem('formaciones', item)" />
              </div>
            </li>
          </ul>
        </VCard>

        <!-- Experiencia -->
        <VCard class="perfil-card" elevation="0">
          <div class="perfil-seccion-cabecera">
            <h2 class="perfil-seccion">
              Experiencia laboral
            </h2>
            <VBtn variant="tonal" prepend-icon="tabler-plus" @click="abrirDialogo('experiencias')">
              Agregar
            </VBtn>
          </div>

          <p v-if="!experiencias.length" class="perfil-vacio">
            Aún no has agregado experiencia laboral.
          </p>

          <ul v-else class="perfil-lista">
            <li v-for="item in experiencias" :key="item.id">
              <div>
                <strong>{{ item.puesto || item.empresa }}</strong>
                <span v-if="item.puesto">{{ item.empresa }}</span>
                <small>{{ periodo(item) }}</small>
              </div>
              <div class="perfil-acciones">
                <VBtn icon="tabler-edit" variant="text" size="small" aria-label="Editar" @click="abrirDialogo('experiencias', item)" />
                <VBtn icon="tabler-trash" variant="text" size="small" color="error" aria-label="Eliminar" @click="eliminarItem('experiencias', item)" />
              </div>
            </li>
          </ul>
        </VCard>

        <!-- Conocimientos -->
        <VCard class="perfil-card" elevation="0">
          <div class="perfil-seccion-cabecera">
            <h2 class="perfil-seccion">
              Conocimientos y habilidades
            </h2>
            <VBtn variant="tonal" prepend-icon="tabler-plus" @click="abrirDialogo('conocimientos')">
              Agregar
            </VBtn>
          </div>

          <p v-if="!conocimientos.length" class="perfil-vacio">
            Aún no has agregado conocimientos.
          </p>

          <ul v-else class="perfil-lista">
            <li v-for="item in conocimientos" :key="item.id">
              <div>
                <strong>{{ item.descripcion }}</strong>
                <small v-if="item.nivel">Nivel: {{ item.nivel }}</small>
              </div>
              <div class="perfil-acciones">
                <VBtn icon="tabler-edit" variant="text" size="small" aria-label="Editar" @click="abrirDialogo('conocimientos', item)" />
                <VBtn icon="tabler-trash" variant="text" size="small" color="error" aria-label="Eliminar" @click="eliminarItem('conocimientos', item)" />
              </div>
            </li>
          </ul>
        </VCard>
      </template>
    </VContainer>

    <VDialog v-model="dialogo" max-width="520" :persistent="guardandoItem">
      <VCard class="pa-2">
        <VCardTitle>{{ itemId ? 'Editar' : 'Agregar' }} {{ titulos[recurso] }}</VCardTitle>

        <VCardText>
          <VForm ref="refFormItem" :disabled="guardandoItem" @submit.prevent="guardarItem">
            <VRow>
              <template v-if="recurso === 'conocimientos'">
                <VCol cols="12">
                  <AppTextField v-model="form.descripcion" :rules="[requiredValidator]" label="Conocimiento o habilidad" maxlength="255" />
                </VCol>
                <VCol cols="12">
                  <AppSelect v-model="form.nivel" :items="niveles" label="Nivel (opcional)" clearable />
                </VCol>
              </template>

              <template v-else>
                <VCol cols="12">
                  <AppTextField
                    v-if="recurso === 'experiencias'"
                    v-model="form.empresa"
                    :rules="[requiredValidator]"
                    label="Empresa"
                    maxlength="255"
                  />
                  <AppTextField
                    v-else
                    v-model="form.nombre"
                    :rules="[requiredValidator]"
                    label="Institución"
                    maxlength="255"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-if="recurso === 'experiencias'"
                    v-model="form.puesto"
                    label="Puesto (opcional)"
                    maxlength="45"
                  />
                  <AppTextField
                    v-else
                    v-model="form.titulo_carrera"
                    label="Título o carrera (opcional)"
                    maxlength="255"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="form.fecha_inicio"
                    :rules="[requiredValidator]"
                    label="Fecha de inicio"
                    type="date"
                    :max="hoy"
                  />
                </VCol>
                <VCol cols="12" md="6">
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
                  <VCheckbox
                    v-model="actual"
                    density="comfortable"
                    :label="recurso === 'experiencias' ? 'Trabajo aquí actualmente' : 'Estudio aquí actualmente'"
                    hide-details
                  />
                </VCol>
              </template>
            </VRow>
          </VForm>
        </VCardText>

        <VCardActions class="justify-end">
          <VBtn variant="text" :disabled="guardandoItem" @click="dialogo = false">
            Cancelar
          </VBtn>
          <VBtn
            color="#123e66"
            variant="flat"
            :loading="guardandoItem"
            :disabled="guardandoItem"
            @click="guardarItem"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
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
</style>

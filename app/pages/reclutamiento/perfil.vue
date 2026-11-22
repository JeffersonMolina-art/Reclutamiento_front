<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

useSeoMeta({ title: 'Mi perfil y currículum' })

const { peticion, estaAutenticado, token } = useCandidatoSesion()

const sesionExpirada = async (error: any) => {
  const estado = error?.statusCode ?? error?.response?.status

  if (estado !== 401 && estado !== 403)
    return false

  token.value = null
  await navigateTo('/reclutamiento/login')

  return true
}

const cargando = ref(true)
const errorCarga = ref('')

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
const cv = ref<any>(null)

async function cargar() {
  cargando.value = true
  errorCarga.value = ''

  try {
    const { data } = await peticion<{ data: any }>('/api/portal/perfil')

    datos.value = {
      ...datos.value,
      ...data.datos,
      segundo_nombre: data.datos.segundo_nombre ?? '',
      tercer_nombre: data.datos.tercer_nombre ?? '',
      segundo_apellido: data.datos.segundo_apellido ?? '',
    }
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

      <VProgressLinear
        v-if="cargando"
        indeterminate
        color="#123e66"
      />

      <VAlert
        v-else-if="errorCarga"
        type="error"
        variant="tonal"
        role="alert"
      >
        {{ errorCarga }}
        <template #append>
          <VBtn
            variant="text"
            @click="cargar"
          >
            Reintentar
          </VBtn>
        </template>
      </VAlert>

      <template v-else>
        <PerfilCurriculum v-model="cv" />
        <PerfilDatosPersonales v-model="datos" />
        <PerfilTrayectoriaSeccion
          v-model="formaciones"
          recurso="formaciones"
        />
        <PerfilTrayectoriaSeccion
          v-model="experiencias"
          recurso="experiencias"
        />
        <PerfilTrayectoriaSeccion
          v-model="conocimientos"
          recurso="conocimientos"
        />
      </template>
    </VContainer>
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
</style>

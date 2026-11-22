<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

useSeoMeta({ title: 'Mis postulaciones' })

const { estaAutenticado, postulaciones, cargarPostulaciones, token } = useCandidatoSesion()

const cargando = ref(true)
const errorCarga = ref('')

const dialogOferta = ref(false)
const postulacionOfertaId = ref<number | null>(null)

function verOferta(id: number) {
  postulacionOfertaId.value = id
  dialogOferta.value = true
}

async function recargarPostulaciones() {
  try {
    await cargarPostulaciones()
  }
  catch {
    errorCarga.value = 'No se pudieron actualizar tus postulaciones.'
  }
}

const formatoFecha = new Intl.DateTimeFormat('es-GT', { dateStyle: 'long', timeZone: 'UTC' })

const coloresEstado: Record<string, string> = {
  recibida: 'info',
  en_revision: 'warning',
  entrevista: 'primary',
  oferta: 'info',
  contratado: 'success',
  descartada: 'error',
}

const fechaVisible = (fecha: string | null) => fecha ? formatoFecha.format(new Date(fecha)) : ''

async function cargar() {
  cargando.value = true
  errorCarga.value = ''

  try {
    await cargarPostulaciones()
  }
  catch (error: any) {
    const estado = error?.statusCode ?? error?.response?.status

    if (estado === 401 || estado === 403) {
      token.value = null
      await navigateTo('/reclutamiento/login')

      return
    }

    errorCarga.value = 'No se pudieron cargar tus postulaciones.'
  }
  finally {
    cargando.value = false
  }
}

onMounted(() => {
  if (!estaAutenticado.value)
    return navigateTo({ path: '/reclutamiento/login' })

  return cargar()
})
</script>

<template>
  <div class="postulaciones-pagina">
    <VContainer class="postulaciones-contenedor">
      <header class="postulaciones-encabezado">
        <h1>Mis postulaciones</h1>
        <p>Consulta las vacantes a las que te has postulado y el estado de cada proceso.</p>
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

      <VCard v-else-if="!postulaciones.length" class="postulaciones-vacio" elevation="0">
        <VIcon icon="tabler-briefcase-off" size="48" aria-hidden="true" />
        <h2>Aún no te has postulado</h2>
        <p>Explora las vacantes disponibles y postúlate a la que más se ajuste a tu perfil.</p>
        <VBtn color="#123e66" to="/reclutamiento/vacantes">
          Ver vacantes
        </VBtn>
      </VCard>

      <div v-else class="postulaciones-lista">
        <VCard
          v-for="postulacion in postulaciones"
          :key="postulacion.id"
          tag="article"
          class="postulacion-card"
          elevation="0"
        >
          <div class="postulacion-info">
            <h2>{{ postulacion.vacante }}</h2>

            <div class="postulacion-meta">
              <span v-if="postulacion.sede">
                <VIcon icon="tabler-map-pin" size="16" aria-hidden="true" />
                {{ postulacion.sede }}
              </span>
              <span v-if="postulacion.puesto && postulacion.puesto !== postulacion.vacante">
                <VIcon icon="tabler-briefcase" size="16" aria-hidden="true" />
                {{ postulacion.puesto }}
              </span>
              <span>
                <VIcon icon="tabler-calendar" size="16" aria-hidden="true" />
                Postulado el {{ fechaVisible(postulacion.fecha_postulacion) }}
              </span>
            </div>
          </div>

          <div class="d-flex align-center flex-wrap ga-3">
            <VBtn
              v-if="postulacion.estado_codigo === 'oferta'"
              color="#123e66"
              variant="flat"
              size="small"
              prepend-icon="tabler-file-dollar"
              @click="verOferta(postulacion.id)"
            >
              Ver oferta
            </VBtn>

            <VChip
              :color="coloresEstado[postulacion.estado_codigo ?? ''] ?? 'secondary'"
              variant="flat"
              class="postulacion-estado"
            >
              {{ postulacion.estado ?? 'En proceso' }}
            </VChip>
          </div>

          <PostulacionProgresoCandidato :codigo-estado="postulacion.estado_codigo" />
        </VCard>
      </div>

      <ModalOferta
        v-model:mostrar-modal="dialogOferta"
        :postulacion-id="postulacionOfertaId"
        @respondida="recargarPostulaciones"
      />
    </VContainer>
  </div>
</template>

<style scoped>
.postulaciones-pagina {
  min-block-size: 80vh;
  padding-block: 2.5rem 4rem;
  background: #f5f7fa;
}

.postulaciones-contenedor {
  max-inline-size: 56rem;
}

.postulaciones-encabezado {
  margin-block-end: 1.75rem;
  padding-block-end: 1rem;
  border-block-end: 3px solid #ffb300;
}

.postulaciones-encabezado h1 {
  margin: 0;
  color: #000;
  font-size: clamp(1.6rem, 3.5vw, 2.1rem);
  font-weight: 800;
}

.postulaciones-encabezado p {
  margin: 0.4rem 0 0;
  color: #000;
}

.postulaciones-lista {
  display: grid;
  gap: 1rem;
}

.postulacion-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(18, 62, 102, 0.12);
  border-radius: 0.875rem;
  background: #fff;
}

.postulacion-info h2 {
  margin: 0 0 0.5rem;
  color: #123e66;
  font-size: 1.125rem;
  font-weight: 700;
}

.postulacion-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  color: #526375;
  font-size: 0.9rem;
}

.postulacion-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.postulacion-estado {
  font-weight: 600;
}

.postulaciones-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  border: 1px dashed rgba(18, 62, 102, 0.25);
  border-radius: 1rem;
  background: #fff;
  color: #526375;
  text-align: center;
}

.postulaciones-vacio h2 {
  margin: 0;
  color: #123e66;
}
</style>

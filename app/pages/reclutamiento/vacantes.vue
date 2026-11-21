<script setup lang="ts">
import type { VacantePublicaInterface } from '@/types/reclutamiento'

definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

useSeoMeta({
  title: 'Vacantes disponibles',
  description: 'Consulta las oportunidades laborales de Cooperativa Guayacán.',
})

const { obtenerVacantes } = usePortalReclutamiento()
const { showToastError, showToastSuccess } = useToast()
const { estaAutenticado, idsPostulados, postular, cargarPostulaciones, token } = useCandidatoSesion()
const route = useRoute()
const postulando = ref(false)

const yaPostulado = (id: number) => idsPostulados.value.has(id)

async function postularme(vacanteId: number) {
  if (!estaAutenticado.value) {
    await navigateTo({ path: '/reclutamiento/login', query: { vacante: String(vacanteId) } })

    return
  }

  if (postulando.value || yaPostulado(vacanteId))
    return

  postulando.value = true

  try {
    const respuesta = await postular(vacanteId)

    showToastSuccess(respuesta.message)
    modalDetalle.value = false
  }
  catch (error: any) {
    const estado = error?.statusCode ?? error?.response?.status

    if (estado === 401 || estado === 403) {
      token.value = null
      await navigateTo({ path: '/reclutamiento/login', query: { vacante: String(vacanteId) } })

      return
    }

    if (error?.data?.requiere_cv) {
      showToastError(error.data.message)
      await navigateTo('/reclutamiento/perfil')

      return
    }

    if (estado === 409)
      await cargarPostulaciones().catch(() => {})

    showToastError(error?.data?.message ?? 'No se pudo completar la postulación')
  }
  finally {
    postulando.value = false
  }
}

const vacantes = ref<VacantePublicaInterface[]>([])
const cargando = ref(true)
const errorCarga = ref('')
const buscar = ref<string | null>('')
const busquedaAplicada = ref('')
const pagina = ref(1)
const totalPaginas = ref(1)
const modalDetalle = ref(false)
const vacanteSeleccionada = ref<(typeof tarjetas.value)[number] | null>(null)

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'long',
  timeZone: 'UTC',
})
function fechaPublicacionVisible(fecha?: string | null) {
  if (!fecha)
    return null

  const valor = new Date(fecha)

  return Number.isNaN(valor.getTime()) ? null : formatoFecha.format(valor)
}
function abrirDetalle(vacante: (typeof tarjetas.value)[number]) {
  vacanteSeleccionada.value = vacante
  modalDetalle.value = true
}

let temporizador: ReturnType<typeof setTimeout> | undefined
let solicitudActual = 0

const moneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const etiquetasModalidad: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
}

function modalidadVisible(modalidad: string) {
  const clave = modalidad.trim().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')

  return etiquetasModalidad[clave] ?? modalidad
}

function rangoSalarial(vacante: VacantePublicaInterface) {
  const { salario_minimo: minimo, salario_maximo: maximo } = vacante

  if (minimo == null || maximo == null || String(minimo).trim() === '' || String(maximo).trim() === '')
    return null

  const desde = Number(minimo)
  const hasta = Number(maximo)

  if (!Number.isFinite(desde) || !Number.isFinite(hasta))
    return null

  return desde === hasta
    ? moneda.format(desde)
    : `${moneda.format(desde)} – ${moneda.format(hasta)}`
}

const tarjetas = computed(() => vacantes.value.map(vacante => ({
  ...vacante,
  rangoSalarial: rangoSalarial(vacante),
})))

async function cargar() {
  const solicitud = ++solicitudActual
  cargando.value = true
  errorCarga.value = ''

  try {
    const respuesta = await obtenerVacantes({
      page: pagina.value,
      buscar: busquedaAplicada.value,
    })

    if (solicitud !== solicitudActual)
      return

    vacantes.value = respuesta.data
    totalPaginas.value = respuesta.meta?.last_page ?? 1
  }
  catch (error: unknown) {
    if (solicitud !== solicitudActual)
      return

    const respuesta = error as {
      response?: { data?: { message?: string } }
    } | null

    errorCarga.value = respuesta?.response?.data?.message
      ?? 'No se pudieron cargar las vacantes.'

    showToastError(errorCarga.value)
  }
  finally {
    if (solicitud === solicitudActual)
      cargando.value = false
  }
}

function aplicarBusqueda() {
  clearTimeout(temporizador)

  const termino = buscar.value?.trim() ?? ''

  if (termino === busquedaAplicada.value)
    return

  busquedaAplicada.value = termino

  if (pagina.value === 1)
    void cargar()
  else
    pagina.value = 1
}

watch(buscar, () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(aplicarBusqueda, 400)
})

watch(pagina, cargar)

onMounted(async () => {
  if (estaAutenticado.value)
    await cargarPostulaciones().catch(() => {})

  await cargar()

  const deseada = Number(route.query.vacante)
  const encontrada = tarjetas.value.find(v => v.id === deseada)

  if (encontrada)
    abrirDetalle(encontrada)
})

onBeforeUnmount(() => {
  clearTimeout(temporizador)
  solicitudActual++
})
</script>

<template>
  <div class="vacantes-pagina">
    <header class="vacantes-encabezado">
      <div class="vacantes-encabezado-decoracion" aria-hidden="true" />
      <VContainer class="vacantes-contenedor vacantes-intro">
        <NuxtLink to="/reclutamiento" class="vacantes-enlace">
          <VIcon icon="tabler-arrow-left" size="16" aria-hidden="true" />
          <span>Portal de empleo Guayacán</span>
        </NuxtLink>

        <h1>Vacantes disponibles</h1>

        <p>
          Encuentra tu próximo puesto en Cooperativa Guayacán y construye tu carrera con nosotros.
        </p>
      </VContainer>
    </header>

    <VContainer class="vacantes-contenedor vacantes-listado">
      <form
        class="vacantes-buscador"
        role="search"
        aria-label="Buscar vacantes"
        @submit.prevent="aplicarBusqueda"
      >
        <AppTextField
          v-model="buscar"
          label="Buscar vacante"
          placeholder="Ej. Desarrollador Laravel, Asesor Financiero..."
          prepend-inner-icon="tabler-search"
          clearable
          hide-details
        />

        <VBtn type="submit" color="#123e66" size="large" class="vacantes-buscador-btn">
          Buscar
        </VBtn>
      </form>

      <div v-if="cargando" role="status" class="vacantes-cargando">
        <VProgressCircular indeterminate color="#123e66" size="36" width="3" />
        <span>Cargando vacantes…</span>
      </div>

      <VAlert v-else-if="errorCarga" type="error" variant="tonal" class="vacantes-alerta">
        <div class="vacantes-alerta-contenido">
          <span>{{ errorCarga }}</span>
          <VBtn variant="outlined" color="error" size="small" @click="cargar">
            Reintentar
          </VBtn>
        </div>
      </VAlert>

      <VAlert v-else-if="!tarjetas.length" type="info" variant="tonal" class="vacantes-alerta">
        {{ busquedaAplicada
        ? `No encontramos vacantes para «${busquedaAplicada}».`
        : 'No hay vacantes disponibles por el momento.' }}
      </VAlert>

      <template v-else>
        <div v-if="busquedaAplicada" class="vacantes-resultados" role="status">
          <VIcon icon="tabler-filter" size="18" aria-hidden="true" />
          <span>Resultados para <strong>«{{ busquedaAplicada }}»</strong></span>
        </div>

        <div class="vacantes-grid">
          <VCard
            v-for="vacante in tarjetas"
            :key="vacante.id"
            tag="article"
            class="vacante-card"
            elevation="0"
          >
            <div class="vacante-cuerpo">
              <div class="vacante-superior">
                <span class="vacante-icono" aria-hidden="true">
                  <VIcon icon="tabler-briefcase" size="24" />
                </span>

                <span v-if="vacante.modalidad_trabajo" class="vacante-modalidad">
                  {{ modalidadVisible(vacante.modalidad_trabajo) }}
                </span>

                <VChip
                  v-if="yaPostulado(vacante.id)"
                  color="success"
                  size="small"
                  variant="flat"
                  prepend-icon="tabler-circle-check"
                >
                  Postulado
                </VChip>
              </div>

              <h2>{{ vacante.nombre }}</h2>

              <div class="vacante-meta">
                <span v-if="vacante.puesto && vacante.puesto !== vacante.nombre" class="vacante-puesto">
                  {{ vacante.puesto }}
                </span>
                <span v-if="vacante.sede" class="vacante-dato">
                  <VIcon icon="tabler-map-pin" size="16" aria-hidden="true" />
                  {{ vacante.sede }}
                </span>
                <span v-if="vacante.cantidad_plazas" class="vacante-dato">
                  <VIcon icon="tabler-users" size="16" aria-hidden="true" />
                  {{ vacante.cantidad_plazas }}
                  {{ Number(vacante.cantidad_plazas) === 1 ? 'plaza' : 'plazas' }}
                </span>
              </div>

              <p v-if="vacante.descripcion" class="vacante-descripcion">
                {{ vacante.descripcion }}
              </p>
            </div>

            <div class="vacante-pie">
              <div v-if="vacante.rangoSalarial" class="vacante-salario">
                <span>Rango salarial</span>
                <strong>{{ vacante.rangoSalarial }}</strong>
              </div>

              <VBtn
                color="#4d8b31"
                variant="flat"
                class="vacante-aplicar"
                append-icon="tabler-arrow-right"
                :aria-label="'Ver detalles de ' + vacante.nombre"
                @click="abrirDetalle(vacante)"
              >
                Ver detalles
              </VBtn>
            </div>
          </VCard>
        </div>
      </template>

      <VPagination
        v-if="!errorCarga && totalPaginas > 1"
        v-model="pagina"
        :length="totalPaginas"
        :total-visible="5"
        :disabled="cargando"
        color="#123e66"
        class="mt-8"
      />
    </VContainer>

    <ModalBasico
      v-model:mostrar-modal="modalDetalle"
      :titulo="vacanteSeleccionada?.nombre"
      :subtitulo="[
        vacanteSeleccionada?.puesto,
        vacanteSeleccionada?.sede,
      ].filter(Boolean).join(' · ')"
      :card-props="{ class: 'detalle-vacante' }"
      max-width="760"
      scrollable
      :aria-label="vacanteSeleccionada?.nombre || 'Detalle de vacante'"
    >
      <div v-if="vacanteSeleccionada" class="detalle-cuerpo">
        <dl class="detalle-datos">
          <div v-if="vacanteSeleccionada.modalidad_trabajo" class="detalle-dato">
            <span class="detalle-icono" aria-hidden="true">
              <VIcon icon="tabler-device-laptop" size="20" />
            </span>
            <div>
              <dt>Modalidad</dt>
              <dd>{{ modalidadVisible(vacanteSeleccionada.modalidad_trabajo) }}</dd>
            </div>
          </div>

          <div v-if="vacanteSeleccionada.cantidad_plazas != null" class="detalle-dato">
            <span class="detalle-icono" aria-hidden="true">
              <VIcon icon="tabler-users" size="20" />
            </span>
            <div>
              <dt>Plazas disponibles</dt>
              <dd>{{ vacanteSeleccionada.cantidad_plazas }}</dd>
            </div>
          </div>

          <div v-if="vacanteSeleccionada.rangoSalarial" class="detalle-dato detalle-dato--salario">
            <span class="detalle-icono" aria-hidden="true">
              <VIcon icon="tabler-wallet" size="20" />
            </span>
            <div>
              <dt>Rango salarial</dt>
              <dd>{{ vacanteSeleccionada.rangoSalarial }}</dd>
            </div>
          </div>

          <div
            v-if="fechaPublicacionVisible(vacanteSeleccionada.fecha_publicacion)"
            class="detalle-dato"
          >
            <span class="detalle-icono" aria-hidden="true">
              <VIcon icon="tabler-calendar-event" size="20" />
            </span>
            <div>
              <dt>Fecha de publicación</dt>
              <dd>{{ fechaPublicacionVisible(vacanteSeleccionada.fecha_publicacion) }}</dd>
            </div>
          </div>
        </dl>

        <section
          v-if="vacanteSeleccionada.descripcion"
          class="detalle-seccion"
          aria-labelledby="detalle-titulo-descripcion"
        >
          <h3 id="detalle-titulo-descripcion">Descripción del puesto</h3>
          <p class="detalle-descripcion">
            {{ vacanteSeleccionada.descripcion }}
          </p>
        </section>

        <section
          v-if="vacanteSeleccionada.caracteristicas?.length"
          class="detalle-seccion"
          aria-labelledby="detalle-titulo-caracteristicas"
        >
          <h3 id="detalle-titulo-caracteristicas">Características</h3>

          <dl class="detalle-lista">
            <div
              v-for="(item, indice) in vacanteSeleccionada.caracteristicas"
              :key="indice"
              class="detalle-fila"
            >
              <dt>{{ item.nombre }}</dt>
              <dd>{{ item.valor || 'Por confirmar' }}</dd>
            </div>
          </dl>
        </section>

        <section
          v-if="vacanteSeleccionada.requisitos?.length"
          class="detalle-seccion"
          aria-labelledby="detalle-titulo-requisitos"
        >
          <h3 id="detalle-titulo-requisitos">Requisitos</h3>

          <ul class="detalle-lista">
            <li
              v-for="(item, indice) in vacanteSeleccionada.requisitos"
              :key="indice"
              class="detalle-fila"
            >
              <span class="detalle-requisito">
                <VIcon
                  icon="tabler-circle-check-filled"
                  size="18"
                  class="detalle-check"
                  aria-hidden="true"
                />
                <span>{{ item.nombre }}</span>
              </span>

              <VChip
                size="small"
                variant="tonal"
                class="detalle-chip"
                :color="item.es_obligatorio ? '#123e66' : '#375e2d'"
              >
                {{ item.es_obligatorio ? 'Obligatorio' : 'Deseable' }}
              </VChip>
            </li>
          </ul>
        </section>

        <div class="detalle-acciones">
          <VBtn variant="tonal" color="secondary" @click="modalDetalle = false">
            Cerrar
          </VBtn>

          <VBtn
            v-if="vacanteSeleccionada && yaPostulado(vacanteSeleccionada.id)"
            color="success"
            variant="tonal"
            prepend-icon="tabler-circle-check"
            to="/reclutamiento/mis-postulaciones"
          >
            Ya te postulaste · Ver mis postulaciones
          </VBtn>

          <VBtn
            v-else
            color="#123e66"
            variant="flat"
            prepend-icon="tabler-send"
            class="detalle-btn-postular"
            :loading="postulando"
            :disabled="postulando"
            @click="postularme(vacanteSeleccionada.id)"
          >
            {{ estaAutenticado ? 'Postularme' : 'Iniciar sesión para postularte' }}
          </VBtn>
        </div>
      </div>
    </ModalBasico>
  </div>
</template>

<style scoped>
.vacantes-pagina {
  --portal-azul: #123e66;
  --portal-azul-oscuro: #0c2944;
  --portal-azul-claro: #1d578c;
  --portal-verde: #80b94e;
  --portal-borde: rgba(var(--v-border-color), var(--v-border-opacity));
  --portal-sombra-suave: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
  --portal-sombra-hover: 0 16px 32px -4px rgba(0, 0, 0, 0.16);

  min-block-size: 80vh;
  background: rgb(var(--v-theme-background));
}

.vacantes-contenedor {
  max-inline-size: 76rem;
}

.vacantes-encabezado {
  position: relative;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(135deg, var(--portal-azul-oscuro) 0%, var(--portal-azul) 55%, var(--portal-azul-claro) 100%);
  border-block-end: 4px solid var(--portal-verde);
}

.vacantes-encabezado-decoracion {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 88% 18%, rgba(128, 185, 78, 0.22) 0%, transparent 42%),
    radial-gradient(circle at 12% 90%, rgba(255, 255, 255, 0.06) 0%, transparent 45%);
}

.vacantes-intro {
  position: relative;
  z-index: 1;
  padding-block: clamp(5.5rem, 8vw, 6.75rem) 4.25rem;
}

.vacantes-enlace {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(128, 185, 78, 0.35);
  border-radius: 999px;
  background: rgba(128, 185, 78, 0.14);
  color: #a3df6f;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.vacantes-enlace:hover {
  background: rgba(128, 185, 78, 0.24);
  transform: translateX(-2px);
}

.vacantes-intro h1 {
  margin-block: 1rem 0.65rem;
  color: #ffffff;
  font-size: clamp(2.15rem, 4.8vw, 3.5rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.vacantes-intro p {
  max-inline-size: 42rem;
  margin: 0;
  color: #d6e4f0;
  font-size: 1.0625rem;
  line-height: 1.6;
}

.vacantes-listado {
  padding-block: 0 4rem;
}

.vacantes-buscador {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  margin-block: -1.75rem 2rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--portal-borde);
  border-radius: 1rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.14);
}

.vacantes-buscador-btn {
  color: #ffffff !important;
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 0.65rem;
  padding-inline: 1.65rem;
}

.vacantes-cargando {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-block: 4.5rem;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-weight: 500;
}

.vacantes-alerta {
  border-radius: 0.9rem;
}

.vacantes-alerta-contenido {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.vacantes-resultados {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-block: 0 1.25rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  font-size: 0.9rem;
}

.vacantes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.vacante-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--portal-borde);
  border-block-start: 4px solid var(--portal-verde);
  border-radius: 1.1rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: var(--portal-sombra-suave);
  transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .vacante-card:hover {
    transform: translateY(-4px);
    border-color: rgba(var(--v-theme-primary), 0.35);
    box-shadow: var(--portal-sombra-hover);
  }
}

.vacante-cuerpo {
  flex: 1;
  padding: 1.5rem 1.5rem 1.35rem;
}

.vacante-superior,
.vacante-meta,
.vacante-dato {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.vacante-superior {
  justify-content: space-between;
  gap: 0.75rem;
}

.vacante-icono {
  display: grid;
  inline-size: 2.85rem;
  block-size: 2.85rem;
  place-items: center;
  border-radius: 0.75rem;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.vacante-modalidad {
  padding: 0.3rem 0.85rem;
  border: 1px solid rgba(var(--v-theme-success), 0.28);
  border-radius: 999px;
  background: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.015em;
  text-transform: capitalize;
}

.vacante-card h2 {
  margin-block: 1.1rem 0.6rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: clamp(1.2rem, 2.2vw, 1.45rem);
  font-weight: 750;
  line-height: 1.28;
  letter-spacing: -0.015em;
  overflow-wrap: anywhere;
}

.vacante-meta {
  gap: 0.45rem 0.85rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.875rem;
  font-weight: 500;
}

.vacante-puesto {
  padding-inline-end: 0.85rem;
  border-inline-end: 1px solid var(--portal-borde);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.vacante-dato {
  gap: 0.3rem;
}

.vacante-dato .v-icon {
  color: rgb(var(--v-theme-success));
}

.vacante-descripcion {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-block: 1rem 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.9375rem;
  line-height: 1.62;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.vacante-pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 1rem 1.5rem;
  border-block-start: 1px solid var(--portal-borde);
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.vacante-salario span,
.vacante-salario strong {
  display: block;
}

.vacante-salario span {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vacante-salario strong {
  margin-block-start: 0.1rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.05rem;
  font-weight: 750;
}

.vacante-aplicar {
  margin-inline-start: auto;
  color: #ffffff !important;
  font-weight: 600;
  border-radius: 0.65rem;
}

@media (max-width: 760px) {
  .vacantes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .vacantes-buscador {
    grid-template-columns: 1fr;
  }

  .vacante-aplicar {
    inline-size: 100%;
  }
}

:global(.detalle-vacante.v-card) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-block-start: 5px solid #80b94e;
  border-radius: 1.25rem;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.28);
}

:global(.detalle-vacante > .v-card-item) {
  padding: 1.5rem 1.75rem 1rem;
  border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.03);
}

:global(.detalle-vacante > .v-card-item .v-card-title) {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -0.02em;
  white-space: normal;
  overflow-wrap: anywhere;
}

:global(.detalle-vacante > .v-card-item .v-card-subtitle) {
  margin-block-start: 0.3rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.95rem;
  font-weight: 600;
  white-space: normal;
  overflow-wrap: anywhere;
}

:global(.detalle-vacante > .v-card-text) {
  padding: 0;
}

.detalle-cuerpo {
  --detalle-borde: rgba(var(--v-border-color), var(--v-border-opacity));
  padding: clamp(1.25rem, 4vw, 1.75rem);
}

.detalle-datos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin: 0;
}

.detalle-dato {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-inline-size: 0;
  padding: 0.95rem 1rem;
  border: 1px solid var(--detalle-borde);
  border-radius: 0.85rem;
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.detalle-dato--salario {
  border-color: rgba(var(--v-theme-success), 0.28);
  background: rgba(var(--v-theme-success), 0.1);
}

.detalle-icono {
  display: grid;
  flex: 0 0 2.5rem;
  place-items: center;
  block-size: 2.5rem;
  border-radius: 0.65rem;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.detalle-dato--salario .detalle-icono {
  background: rgba(var(--v-theme-success), 0.16);
  color: rgb(var(--v-theme-success));
}

.detalle-dato dt {
  margin-block-end: 0.15rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detalle-dato dd {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.975rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.detalle-seccion {
  margin-block-start: 1.75rem;
}

.detalle-seccion h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.85rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem;
  font-weight: 750;
  letter-spacing: -0.01em;
}

.detalle-seccion h3::before {
  content: '';
  display: inline-block;
  inline-size: 4px;
  block-size: 1.1rem;
  border-radius: 99px;
  background: #80b94e;
}

.detalle-descripcion {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 0.965rem;
  line-height: 1.7;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.detalle-lista {
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--detalle-borde);
  border-radius: 0.85rem;
  background: rgb(var(--v-theme-surface));
  list-style: none;
}

.detalle-fila {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding: 0.85rem 1.1rem;
  overflow-wrap: anywhere;
  transition: background-color 0.15s ease;
}

.detalle-fila:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.detalle-fila + .detalle-fila {
  border-block-start: 1px solid var(--detalle-borde);
}

.detalle-fila dt {
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-weight: 500;
}

.detalle-fila dd {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 700;
  overflow-wrap: anywhere;
}

.detalle-requisito {
  display: flex;
  flex: 1 1 14rem;
  align-items: flex-start;
  gap: 0.6rem;
  min-inline-size: 0;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 0.95rem;
  line-height: 1.45;
}

.detalle-check {
  flex-shrink: 0;
  margin-block-start: 0.12rem;
  color: rgb(var(--v-theme-success));
}

.detalle-chip {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.detalle-acciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-block-start: 1.75rem;
  padding-block-start: 1.25rem;
  border-block-start: 1px solid var(--detalle-borde);
}

.detalle-btn-postular {
  color: #ffffff !important;
  font-weight: 600;
  padding-inline: 1.5rem;
  border-radius: 0.65rem;
}

@media (max-width: 560px) {
  .detalle-datos {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 380px) {
  .detalle-acciones > * {
    flex: 1 1 100%;
  }
}
</style>

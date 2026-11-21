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
const { showToastError } = useToast()

const vacantes = ref<VacantePublicaInterface[]>([])
const cargando = ref(true)
const errorCarga = ref('')
const buscar = ref<string | null>('')
const busquedaAplicada = ref('')
const pagina = ref(1)
const totalPaginas = ref(1)

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
onMounted(cargar)

onBeforeUnmount(() => {
  clearTimeout(temporizador)
  solicitudActual++
})
</script>

<template>
  <div class="vacantes-pagina">
    <header class="vacantes-encabezado">
      <VContainer class="vacantes-contenedor vacantes-intro">
        <NuxtLink to="/reclutamiento" class="vacantes-enlace">
          Portal de empleo Guayacán
        </NuxtLink>

        <h1>Vacantes disponibles</h1>

        <p>
          Encuentra tu próximo puesto en Cooperativa Guayacán.
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
          placeholder="Ej. Desarrollador Laravel"
          prepend-inner-icon="tabler-search"
          clearable
          hide-details
        />

        <VBtn type="submit" color="primary" size="large">
          Buscar
        </VBtn>
      </form>

      <div v-if="cargando" role="status" class="vacantes-cargando">
        <VProgressCircular indeterminate color="primary" />
        <span>Cargando vacantes…</span>
      </div>

      <VAlert v-else-if="errorCarga" type="error" variant="tonal">
        {{ errorCarga }}
        <VBtn variant="text" class="ms-sm-3" @click="cargar">
          Reintentar
        </VBtn>
      </VAlert>

      <VAlert v-else-if="!tarjetas.length" type="info" variant="tonal">
        {{ busquedaAplicada
        ? `No encontramos vacantes para «${busquedaAplicada}».`
        : 'No hay vacantes disponibles por el momento.' }}
      </VAlert>

      <template v-else>
        <p v-if="busquedaAplicada" class="vacantes-resultados" role="status">
          Resultados para «{{ busquedaAplicada }}»
        </p>

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
                  <VIcon icon="tabler-briefcase" size="25" />
                </span>

                <span v-if="vacante.modalidad_trabajo" class="vacante-modalidad">
                  {{ modalidadVisible(vacante.modalidad_trabajo) }}
                </span>
              </div>

              <h2>{{ vacante.nombre }}</h2>

              <div class="vacante-meta">
                <span v-if="vacante.puesto && vacante.puesto !== vacante.nombre">
                  {{ vacante.puesto }}
                </span>
                <span v-if="vacante.sede" class="vacante-dato">
                  <VIcon icon="tabler-map-pin" size="17" aria-hidden="true" />
                  {{ vacante.sede }}
                </span>
                <span v-if="vacante.cantidad_plazas" class="vacante-dato">
                  <VIcon icon="tabler-users" size="17" aria-hidden="true" />
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
                color="#123e66"
                variant="flat"
                class="vacante-aplicar"
                :to="{
                  path: '/reclutamiento/registro',
                  query: { vacante: String(vacante.id) },
                }"
                :aria-label="'Postularme a ' + vacante.nombre"
              >
                Postularme
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
        class="mt-7"
      />
    </VContainer>
  </div>
</template>

<style scoped>
.vacantes-pagina {
  --portal-azul: #123e66;
  --portal-verde: #80b94e;
  --portal-borde: rgba(var(--v-border-color), var(--v-border-opacity));

  min-block-size: 70vh;
  background: rgb(var(--v-theme-background));
}

.vacantes-contenedor {
  max-inline-size: 76rem;
}

.vacantes-encabezado {
  color: #fff;
  background:
    radial-gradient(ellipse at 90% 15%, #2b6892 0%, transparent 52%),
    linear-gradient(120deg, #102b49, #133f67);
  border-block-end: 4px solid var(--portal-verde);
}

.vacantes-intro {
  padding-block: clamp(2.75rem, 6vw, 4.5rem) 3.75rem;
}

.vacantes-enlace {
  color: #379a48;
  font-size: .9375rem;
  font-weight: 650;
  text-underline-offset: .2em;
}

.vacantes-intro h1 {
  margin-block: .65rem;
  font-size: clamp(2.25rem, 5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -.045em;
  color: #379a48;
}

.vacantes-intro p {
  margin: 0;
  color: #e1ebf4;
  font-size: 1.0625rem;
}

.vacantes-listado {
  padding-block: 0 3.5rem;
}

.vacantes-buscador {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: .85rem;
  margin-block: -1.45rem 1.6rem;
  padding: .9rem;
  border: 1px solid var(--portal-borde);
  border-radius: .95rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 6px 22px rgb(15 42 73 / 9%);
}

.vacantes-cargando {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .85rem;
  padding-block: 3rem;
}

.vacantes-resultados {
  margin-block: 0 1rem;
}

.vacantes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.vacante-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--portal-borde);
  border-block-start: 3px solid var(--portal-verde);
  border-radius: 1rem;
  box-shadow: 0 5px 18px rgb(15 42 73 / 6%);
  transition: box-shadow .18s ease, transform .18s ease;
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .vacante-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgb(15 42 73 / 12%);
  }
}

.vacante-cuerpo {
  flex: 1;
  padding: 1.35rem;
}

.vacante-superior,
.vacante-meta,
.vacante-dato {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .65rem;
}

.vacante-superior {
  justify-content: space-between;
}

.vacante-icono {
  display: grid;
  inline-size: 3rem;
  block-size: 3rem;
  place-items: center;
  border-radius: .8rem;
  background: #e9f2fa;
  color: var(--portal-azul);
}

.vacante-modalidad {
  padding: .35rem .75rem;
  border-radius: 999px;
  background: #eaf4e4;
  color: #2e5624;
  font-size: .875rem;
  font-weight: 700;
  text-transform: capitalize;
}

.vacante-card h2 {
  margin-block: .95rem .55rem;
  font-size: clamp(1.25rem, 2.5vw, 1.55rem);
  font-weight: 750;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.vacante-meta {
  gap: .45rem 1rem;
  font-size: .9375rem;
}

.vacante-dato {
  gap: .3rem;
}

.vacante-descripcion {
  margin-block: .9rem 0;
  line-height: 1.6;
  overflow-wrap: anywhere;
  white-space: pre-line;
}

.vacante-pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: 1rem 1.35rem;
  border-block-start: 1px solid var(--portal-borde);
  background: rgba(var(--v-theme-primary), .04);
}

.vacante-salario span,
.vacante-salario strong {
  display: block;
}

.vacante-salario span {
  font-size: .875rem;
}

.vacante-salario strong {
  font-size: 1.0625rem;
}

.vacante-aplicar {
  margin-inline-start: auto;
}

@media (max-width: 700px) {
  .vacantes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .vacantes-buscador {
    grid-template-columns: 1fr;
  }

  .vacante-aplicar {
    inline-size: 100%;
  }
}
</style>

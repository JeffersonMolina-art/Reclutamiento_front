<script setup lang="ts">
import { MODEL_TYPE_VACANTE } from '@/constantes/ModelTypes'
import type { SendResponseInterface } from '@/types/sistema/types'
import type { VacanteInterface } from '@/types/vacante/types'

definePageMeta({
  navActiveLink: 'vacante',
  middleware: 'permissions',
  action: 'ver vacantes',
  subject: 'Vacante',
})

type VacanteDetalle = VacanteInterface & {
  id: number
  estado?: { nombre: string, codigo: string } | null
  puesto?: { nombre: string } | null
  sede?: { nombre: string } | null
  estado_nombre?: string | null
  puesto_nombre?: string | null
  sede_nombre?: string | null
  encargado_nombre?: string | null
  encargado?: { nombre_completo?: string | null } | null
}

const { get } = useClienteRequest()
const route = useRoute()

const vacante = ref<VacanteDetalle | null>(null)
const cargando = ref(true)
const errorCarga = ref(false)

const modalidades: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
}

const coloresEstado: Record<string, string> = {
  borrador: 'secondary',
  publicada: 'success',
  pausada: 'warning',
  cerrada: 'error',
}

const moneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
})

const fecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeZone: 'UTC',
})

function formatearSalario(valor: string | number | null | undefined) {
  if (valor == null || String(valor).trim() === '')
    return null

  const monto = Number(valor)

  return Number.isFinite(monto) ? moneda.format(monto) : null
}

function formatearFecha(valor: string | null | undefined) {
  if (!valor)
    return 'Sin fecha de publicación'

  const dia = new Date(`${valor.slice(0, 10)}T00:00:00Z`)

  return Number.isNaN(dia.getTime()) ? valor : fecha.format(dia)
}

const rangoSalarial = computed(() => {
  const minimo = formatearSalario(vacante.value?.salario_minimo)
  const maximo = formatearSalario(vacante.value?.salario_maximo)

  if (minimo && maximo)
    return minimo === maximo ? minimo : `${minimo} – ${maximo}`

  if (minimo)
    return `Desde ${minimo}`

  if (maximo)
    return `Hasta ${maximo}`

  return 'Sin definir'
})

async function getVacante() {
  cargando.value = true
  errorCarga.value = false

  try {
    const respuesta = await get<SendResponseInterface<VacanteDetalle>>(
      `api/reclutamiento/vacantes/${route.params.id}`,
    )

    vacante.value = respuesta.data
  }
  catch (error) {
    errorCarga.value = true
    manejaError(error)
  }
  finally {
    cargando.value = false
  }
}

onMounted(getVacante)
</script>

<template>
  <div>
    <header class="d-flex justify-space-between align-start flex-wrap ga-3 mb-5">
      <div>
        <div class="d-flex align-center flex-wrap ga-2">
          <h1 class="text-h4 font-weight-bold">
            {{ vacante?.nombre || 'Detalle de la vacante' }}
          </h1>

          <VChip
            v-if="vacante"
            :color="coloresEstado[vacante.estado?.codigo ?? ''] ?? 'secondary'"
            variant="tonal"
            size="small"
          >
            {{ vacante.estado_nombre || vacante.estado?.nombre || 'Sin estado' }}
          </VChip>
        </div>

        <p
          v-if="vacante?.puesto_nombre || vacante?.puesto?.nombre"
          class="text-body-2 text-medium-emphasis mt-1 mb-0"
        >
          {{ vacante.puesto_nombre || vacante.puesto?.nombre }}
        </p>
      </div>

      <div class="d-flex flex-wrap ga-2">
        <BitacoraModal
          v-if="vacante"
          :model-id="vacante.id"
          :model-type="MODEL_TYPE_VACANTE"
          titulo="Bitácora de la vacante"
          text="Bitácora"
          variant="tonal"
        />

        <VBtn
          to="/vacante"
          color="secondary"
          variant="outlined"
          prepend-icon="tabler-arrow-back-up"
        >
          Regresar
        </VBtn>
      </div>
    </header>

    <VProgressLinear v-if="cargando" indeterminate rounded color="primary" />

    <VAlert v-else-if="errorCarga" type="error" variant="tonal">
      No se pudo cargar la vacante.

      <template #append>
        <VBtn variant="text" @click="getVacante">
          Reintentar
        </VBtn>
      </template>
    </VAlert>

    <VRow v-else-if="vacante">
      <VCol cols="12" md="8">
        <VCard variant="outlined" rounded="lg">
          <VCardText class="pa-5">
            <h2 class="text-h6 mb-2">
              Descripción del puesto
            </h2>

            <p class="vacante-descripcion mb-0">
              {{ vacante.descripcion || 'Sin descripción.' }}
            </p>

            <template v-if="vacante.requisitos?.length">
              <VDivider class="my-5" />

              <h2 class="text-h6 mb-3">
                Requisitos
              </h2>

              <ul class="vacante-requisitos">
                <li
                  v-for="(requisito, indice) in vacante.requisitos"
                  :key="requisito.id ?? indice"
                >
                  <span>{{ requisito.nombre }}</span>
                  <VChip
                    :color="requisito.es_obligatorio ? 'primary' : 'secondary'"
                    variant="tonal"
                    size="x-small"
                  >
                    {{ requisito.es_obligatorio ? 'Obligatorio' : 'Deseable' }}
                  </VChip>
                </li>
              </ul>
            </template>

            <template v-if="vacante.caracteristicas?.length">
              <VDivider class="my-5" />

              <h2 class="text-h6 mb-3">
                Características
              </h2>

              <dl class="vacante-datos">
                <div
                  v-for="(caracteristica, indice) in vacante.caracteristicas"
                  :key="caracteristica.id ?? indice"
                >
                  <dt>{{ caracteristica.nombre }}</dt>
                  <dd>{{ caracteristica.valor || 'Sin definir' }}</dd>
                </div>
              </dl>
            </template>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VCard variant="outlined" rounded="lg">
          <VCardText class="pa-5">
            <h2 class="text-h6 mb-4">
              Datos de contratación
            </h2>

            <dl class="vacante-datos">
              <div>
                <dt>Sede</dt>
                <dd>{{ vacante.sede_nombre || vacante.sede?.nombre || 'Sin definir' }}</dd>
              </div>
              <div>
                <dt>Unidad</dt>
                <dd>{{ vacante.unidad_nombre || vacante.unidad?.nombre || 'Sin definir' }}</dd>
              </div>
              <div>
                <dt>Modalidad</dt>
                <dd>{{ modalidades[vacante.modalidad_trabajo ?? ''] || vacante.modalidad_trabajo || 'Sin definir' }}</dd>
              </div>
              <div>
                <dt>Plazas</dt>
                <dd>{{ vacante.cantidad_plazas ?? 'Sin definir' }}</dd>
              </div>
              <div>
                <dt>Rango salarial</dt>
                <dd>{{ rangoSalarial }}</dd>
              </div>
              <div>
                <dt>Encargado</dt>
                <dd>
                  {{
                    vacante.encargado_nombre
                    || vacante.encargado?.nombre_completo
                    || (vacante.user_encargado != null ? `Usuario #${vacante.user_encargado}` : 'Sin asignar')
                  }}
                </dd>
              </div>
              <div>
                <dt>Publicación</dt>
                <dd>{{ formatearFecha(vacante.fecha_publicacion) }}</dd>
              </div>
            </dl>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.vacante-descripcion {
  line-height: 1.65;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.vacante-requisitos {
  display: grid;
  gap: 0.75rem;
  padding-inline-start: 1.25rem;
  margin: 0;
}

.vacante-requisitos .v-chip {
  margin-inline-start: 0.5rem;
  vertical-align: middle;
}

.vacante-datos {
  display: grid;
  gap: 0.875rem;
  margin: 0;
}

.vacante-datos dt {
  color: rgba(var(--v-theme-on-surface), 0.65);
  font-size: 0.8125rem;
}

.vacante-datos dd {
  margin: 0.125rem 0 0;
  font-weight: 500;
  overflow-wrap: anywhere;
}
</style>

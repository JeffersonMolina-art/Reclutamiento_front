<script setup lang="ts">
definePageMeta({
  middleware: 'permissions',
  action: 'reportes postulaciones',
  subject: 'Postulacion',
})

const { get } = useClienteRequest()
const { showToastError } = useToast()

const vacanteId = ref<number | null>(null)
const estadoIds = ref<number[]>([])
const fechaDesde = ref('')
const fechaHasta = ref('')
const generando = ref(false)

const rangosRapidos = [
  { clave: 'mes_actual', titulo: 'Este mes' },
  { clave: 'mes_anterior', titulo: 'Mes anterior' },
  { clave: 'ultimos_30_dias', titulo: 'Últimos 30 días' },
  { clave: 'anio_actual', titulo: 'Este año' },
]

const rangoInvalido = computed(() =>
  !!fechaDesde.value && !!fechaHasta.value && fechaHasta.value < fechaDesde.value,
)

const hayFiltros = computed(() => !!vacanteId.value || estadoIds.value.length > 0 || !!fechaDesde.value || !!fechaHasta.value)

const formatearIso = (fecha: Date) => fecha.toLocaleDateString('en-CA')

function aplicarRangoRapido(clave: string) {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth()

  const rangos: Record<string, [Date, Date]> = {
    mes_actual: [new Date(anio, mes, 1), hoy],
    mes_anterior: [new Date(anio, mes - 1, 1), new Date(anio, mes, 0)],
    ultimos_30_dias: [new Date(anio, mes, hoy.getDate() - 29), hoy],
    anio_actual: [new Date(anio, 0, 1), hoy],
  }

  const [desde, hasta] = rangos[clave]

  fechaDesde.value = formatearIso(desde)
  fechaHasta.value = formatearIso(hasta)
}

async function generarReporte() {
  if (rangoInvalido.value || generando.value)
    return

  generando.value = true

  try {
    const respuesta = await get<Blob>('api/reclutamiento/reportes/postulaciones-por-estado', {
      responseType: 'blob',
      params: {
        vacante_id: vacanteId.value || undefined,
        estado_ids: estadoIds.value.length ? estadoIds.value : undefined,
        fecha_desde: fechaDesde.value || undefined,
        fecha_hasta: fechaHasta.value || undefined,
      },
    }) as any

    const url = URL.createObjectURL(new Blob([respuesta.data], { type: 'application/pdf' }))
    const enlace = document.createElement('a')

    enlace.href = url
    enlace.download = `reporte-postulaciones-por-estado-${formatearIso(new Date())}.pdf`
    enlace.click()
    URL.revokeObjectURL(url)
  }
  catch {
    showToastError('No se pudo generar el reporte.')
  }
  finally {
    generando.value = false
  }
}

function limpiar() {
  vacanteId.value = null
  estadoIds.value = []
  fechaDesde.value = ''
  fechaHasta.value = ''
}
</script>

<template>
  <!-- Encabezado -->
  <div class="d-flex align-center gap-4 mb-6">
    <VAvatar
      color="primary"
      variant="tonal"
      size="48"
      rounded="lg"
    >
      <VIcon
        icon="tabler-report-analytics"
        size="26"
      />
    </VAvatar>

    <div>
      <h1 class="text-h4">
        Reporte de postulaciones
      </h1>
    </div>
  </div>

  <!-- Filtros -->
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
            icon="tabler-filter"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Filtros del reporte</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText class="d-flex flex-column gap-5">
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <VLabel class="mb-2">
            Vacante
          </VLabel>
          <SelectorPro
            v-model:item-selected="vacanteId"
            url="api/reclutamiento/vacantes"
            item-value="id"
            item-title="nombre"
            placeholder="Todas las vacantes"
            persistent-placeholder
            :campos-a-filtrar="['nombre']"
          />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <VLabel class="mb-2">
            Estados
          </VLabel>
          <SelectorPro
            v-model:item-selected="estadoIds"
            url="api/catalogo/postulacion_estado"
            item-value="id"
            item-title="nombre"
            placeholder="Todos los estados"
            persistent-placeholder
            multiple
            :campos-a-filtrar="['nombre']"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <AppTextField
            v-model="fechaDesde"
            type="date"
            label="Desde"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
          md="3"
        >
          <AppTextField
            v-model="fechaHasta"
            type="date"
            label="Hasta"
            :error-messages="rangoInvalido ? 'Debe ser igual o posterior a la fecha inicial' : ''"
          />
        </VCol>
      </VRow>

      <div class="d-flex flex-wrap align-center gap-2">
        <span class="text-caption text-medium-emphasis me-1">Rangos rápidos</span>
        <VChip
          v-for="rango in rangosRapidos"
          :key="rango.clave"
          size="small"
          variant="tonal"
          color="primary"
          label
          @click="aplicarRangoRapido(rango.clave)"
        >
          {{ rango.titulo }}
        </VChip>
      </div>
    </VCardText>

    <VDivider />

    <VCardActions class="justify-end pa-4 ga-2">
      <VBtn
        variant="text"
        color="secondary"
        prepend-icon="tabler-clear-all"
        :disabled="generando || !hayFiltros"
        @click="limpiar"
      >
        Limpiar
      </VBtn>
      <VBtn
        color="primary"
        variant="elevated"
        prepend-icon="tabler-file-type-pdf"
        :loading="generando"
        :disabled="rangoInvalido"
        @click="generarReporte"
      >
        Generar PDF
      </VBtn>
    </VCardActions>
  </VCard>
</template>

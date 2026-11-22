<script setup lang="ts">
import type { CandidatoDetalle, VacanteDetalle } from '@/types/reclutamiento/oferta'

const props = defineProps<{
  vacante?: VacanteDetalle | null
  candidato?: CandidatoDetalle | null
}>()

const formateadorMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

const formatearMoneda = (valor?: number | string | null) => {
  const monto = Number(valor)

  return valor === null || valor === undefined || valor === '' || Number.isNaN(monto) ? '—' : formateadorMoneda.format(monto)
}

const datosGenerales = computed(() => [
  { icono: 'tabler-briefcase', etiqueta: 'Puesto', valor: props.vacante?.puesto?.nombre || props.vacante?.nombre || '—' },
  { icono: 'tabler-map-pin', etiqueta: 'Sede', valor: props.vacante?.sede?.nombre || '—' },
  {
    icono: 'tabler-coin',
    etiqueta: 'Rango salarial',
    valor: `${formatearMoneda(props.vacante?.salario_minimo)} – ${formatearMoneda(props.vacante?.salario_maximo)}`,
  },
])

const requisitos = computed(() => props.vacante?.requisitos ?? [])

const expectativaDentroDelRango = computed<boolean | null>(() => {
  const expectativa = Number(props.candidato?.expectativa_salarial)
  const minimo = Number(props.vacante?.salario_minimo)
  const maximo = Number(props.vacante?.salario_maximo)

  if ([expectativa, minimo, maximo].some(Number.isNaN))
    return null

  return expectativa >= minimo && expectativa <= maximo
})

const abierto = ref(false)
</script>

<template>
  <VCard>
    <VCardItem
      class="cursor-pointer"
      @click="abierto = !abierto"
    >
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
      <VCardTitle>Vacante</VCardTitle>

      <template #append>
        <VIcon :icon="abierto ? 'tabler-chevron-up' : 'tabler-chevron-down'" />
      </template>
    </VCardItem>

    <VExpandTransition>
      <div v-show="abierto">
    <VDivider />

    <VCardText class="d-flex flex-column gap-5">
      <VRow dense>
        <VCol
          v-for="dato in datosGenerales"
          :key="dato.etiqueta"
          cols="12"
          sm="6"
        >
          <div class="d-flex align-center gap-3">
            <VIcon
              :icon="dato.icono"
              size="20"
              class="text-medium-emphasis"
            />
            <div class="min-w-0">
              <div class="text-caption text-medium-emphasis">
                {{ dato.etiqueta }}
              </div>
              <div class="text-body-1 font-weight-medium text-break">
                {{ dato.valor }}
              </div>
            </div>
          </div>
        </VCol>
      </VRow>

      <VAlert
        v-if="expectativaDentroDelRango !== null"
        :type="expectativaDentroDelRango ? 'success' : 'warning'"
        variant="tonal"
        density="compact"
      >
        {{ expectativaDentroDelRango
          ? 'La expectativa salarial del candidato está dentro del rango de la plaza.'
          : 'La expectativa salarial del candidato está fuera del rango de la plaza.' }}
      </VAlert>

      <div>
        <div class="text-overline text-medium-emphasis mb-2">
          Requisitos
        </div>

        <div
          v-if="requisitos.length"
          class="d-flex flex-column gap-2"
        >
          <div
            v-for="requisito in requisitos"
            :key="requisito.id"
            class="d-flex align-center justify-space-between gap-2"
          >
            <span class="text-body-2">{{ requisito.nombre }}</span>
            <VChip
              size="x-small"
              label
              variant="tonal"
              :color="requisito.es_obligatorio ? 'error' : 'secondary'"
            >
              {{ requisito.es_obligatorio ? 'Obligatorio' : 'Deseable' }}
            </VChip>
          </div>
        </div>

        <span
          v-else
          class="text-body-2 text-disabled"
        >La vacante no tiene requisitos registrados</span>
      </div>
    </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

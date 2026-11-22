<script setup lang="ts">
import type { CandidatoDetalle } from '@/types/reclutamiento/oferta'

const props = defineProps<{ candidato?: CandidatoDetalle | null }>()

const formateadorMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const formateadorPeriodo = new Intl.DateTimeFormat('es-GT', { month: 'short', year: 'numeric', timeZone: 'UTC' })

const formatearMoneda = (valor?: number | string | null) => {
  const monto = Number(valor)

  return valor === null || valor === undefined || valor === '' || Number.isNaN(monto) ? '—' : formateadorMoneda.format(monto)
}

const formatearPeriodo = (valor?: string | null) =>
  valor ? formateadorPeriodo.format(new Date(valor.slice(0, 10))) : ''

const datosContacto = computed(() => [
  { icono: 'tabler-id', etiqueta: 'DPI', valor: props.candidato?.dpi || '—' },
  { icono: 'tabler-mail', etiqueta: 'Correo electrónico', valor: props.candidato?.correo_contacto || '—' },
  { icono: 'tabler-phone', etiqueta: 'Teléfono', valor: props.candidato?.telefono_contacto || '—' },
  { icono: 'tabler-cash', etiqueta: 'Expectativa salarial', valor: formatearMoneda(props.candidato?.expectativa_salarial) },
])

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
          color="primary"
          variant="tonal"
          size="36"
          rounded
        >
          <VIcon
            icon="tabler-user"
            size="20"
          />
        </VAvatar>
      </template>
      <VCardTitle>Candidato</VCardTitle>

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
          v-for="dato in datosContacto"
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

      <div>
        <div class="text-overline text-medium-emphasis mb-2">
          Conocimientos
        </div>
        <div
          v-if="candidato?.conocimientos?.length"
          class="d-flex flex-wrap gap-2"
        >
          <VChip
            v-for="conocimiento in candidato.conocimientos"
            :key="conocimiento.id"
            size="small"
            label
            variant="tonal"
            color="primary"
          >
            {{ conocimiento.descripcion }}<span v-if="conocimiento.nivel"> · {{ conocimiento.nivel }}</span>
          </VChip>
        </div>
        <span
          v-else
          class="text-body-2 text-disabled"
        >Sin información</span>
      </div>

      <div>
        <div class="text-overline text-medium-emphasis mb-2">
          Experiencia laboral
        </div>
        <div
          v-if="candidato?.experiencias?.length"
          class="d-flex flex-column gap-3"
        >
          <div
            v-for="experiencia in candidato.experiencias"
            :key="experiencia.id"
          >
            <div class="text-body-2 font-weight-medium">
              {{ experiencia.puesto }} — {{ experiencia.empresa }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ formatearPeriodo(experiencia.fecha_inicio) }}
              – {{ experiencia.fecha_fin ? formatearPeriodo(experiencia.fecha_fin) : 'Actualidad' }}
            </div>
          </div>
        </div>
        <span
          v-else
          class="text-body-2 text-disabled"
        >Sin información</span>
      </div>

      <div>
        <div class="text-overline text-medium-emphasis mb-2">
          Formación académica
        </div>
        <div
          v-if="candidato?.formaciones?.length"
          class="d-flex flex-column gap-3"
        >
          <div
            v-for="formacion in candidato.formaciones"
            :key="formacion.id"
          >
            <div class="text-body-2 font-weight-medium">
              {{ formacion.titulo_carrera || formacion.nombre }}
            </div>
            <div
              v-if="formacion.titulo_carrera"
              class="text-caption text-medium-emphasis"
            >
              {{ formacion.nombre }}
            </div>
          </div>
        </div>
        <span
          v-else
          class="text-body-2 text-disabled"
        >Sin información</span>
      </div>
    </VCardText>
      </div>
    </VExpandTransition>
  </VCard>
</template>

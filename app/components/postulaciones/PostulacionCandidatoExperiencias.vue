<script setup lang="ts">
export interface ExperienciaForm { empresa: string; puesto: string; fecha_inicio: string; fecha_fin: string }

const items = defineModel<ExperienciaForm[]>({ required: true })

const hoy = new Date().toLocaleDateString('en-CA')

const reglaRequerido = (valor: string) => !!(valor ?? '').trim() || 'Este campo es obligatorio.'

const reglaFechaInicio = (valor: string) => {
  if (!valor)
    return 'Este campo es obligatorio.'

  return valor <= hoy || 'No puede ser una fecha futura.'
}

const reglaFechaFin = (inicio: string) => (valor: string) => {
  if (!valor)
    return true

  if (valor > hoy)
    return 'No puede ser una fecha futura.'

  return !inicio || valor >= inicio || 'Debe ser igual o posterior al inicio.'
}

const agregar = () => items.value.push({ empresa: '', puesto: '', fecha_inicio: '', fecha_fin: '' })

const quitar = (indice: number) => {
  if (items.value.length > 1)
    items.value.splice(indice, 1)
}
</script>

<template>
  <VExpansionPanel
    value="experiencias"
    eager
  >
    <VExpansionPanelTitle>
      <VIcon
        icon="tabler-briefcase"
        class="me-2"
      />
      Experiencias (mínimo 1)
    </VExpansionPanelTitle>
    <VExpansionPanelText>
      <div class="d-flex justify-end mb-2">
        <VBtn
          size="small"
          variant="tonal"
          prepend-icon="tabler-plus"
          @click="agregar"
        >
          Agregar
        </VBtn>
      </div>
      <VRow
        v-for="(item, indice) in items"
        :key="indice"
        align="center"
      >
        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="item.empresa"
            label="Empresa"
            maxlength="255"
            :rules="[reglaRequerido]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="item.puesto"
            label="Puesto (opcional)"
            maxlength="45"
          />
        </VCol>
        <VCol
          cols="12"
          sm="5"
        >
          <AppTextField
            v-model="item.fecha_inicio"
            label="Fecha de inicio"
            type="date"
            :max="hoy"
            :rules="[reglaFechaInicio]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="5"
        >
          <AppTextField
            v-model="item.fecha_fin"
            label="Fecha de fin (opcional)"
            type="date"
            :max="hoy"
            :rules="[reglaFechaFin(item.fecha_inicio)]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="2"
          class="text-end"
        >
          <VBtn
            icon="tabler-trash"
            variant="text"
            size="small"
            :disabled="items.length === 1"
            @click="quitar(indice)"
          />
        </VCol>
      </VRow>
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

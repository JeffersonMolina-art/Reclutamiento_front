<script setup lang="ts">
export interface ConocimientoForm { descripcion: string; nivel: string }

const items = defineModel<ConocimientoForm[]>({ required: true })

const reglaRequerido = (valor: string) => !!(valor ?? '').trim() || 'Este campo es obligatorio.'

const agregar = () => items.value.push({ descripcion: '', nivel: '' })

const quitar = (indice: number) => {
  if (items.value.length > 1)
    items.value.splice(indice, 1)
}
</script>

<template>
  <VExpansionPanel
    value="conocimientos"
    eager
  >
    <VExpansionPanelTitle>
      <VIcon
        icon="tabler-bulb"
        class="me-2"
      />
      Conocimientos (mínimo 1)
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
          sm="7"
        >
          <AppTextField
            v-model="item.descripcion"
            label="Conocimiento"
            maxlength="255"
            :rules="[reglaRequerido]"
          />
        </VCol>
        <VCol
          cols="9"
          sm="4"
        >
          <AppTextField
            v-model="item.nivel"
            label="Nivel (opcional)"
            maxlength="45"
          />
        </VCol>
        <VCol
          cols="3"
          sm="1"
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

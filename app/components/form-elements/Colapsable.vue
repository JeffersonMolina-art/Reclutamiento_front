<script setup>
import { getCurrentInstance, onMounted, ref, watch } from 'vue'

const props = defineProps({
  titulo: String,
  icono: { type: String, default: null }, // <- Nueva prop opcional
  iconoColor: { type: String, default: 'primary' }, // <- Opcional si deseas colorear el ícono
  abierto: Boolean,
  chipTexto: { type: String, default: null },
  chipColor: { type: String, default: 'primary' },
  componente: [String, Object],
  propsComponente: { type: Object, default: () => ({}) },
  collapseIcon: { type: String, default: 'tabler-minus' },
  expandIcon: { type: String, default: 'tabler-plus' },
  cargando: { type: Boolean, default: false },
  chipClickable: { type: Boolean, default: false },
  chipTooltip: { type: String, default: false },
  chipTooltipProps: { type: Object, default: () => ({}) },
})

const emit = defineEmits([
  'click-chip',
])

const panelActivo = ref(props.abierto ? [0] : [])

watch(() => props.abierto, val => {
  panelActivo.value = val ? [0] : []
})

onMounted(() => {
  const hasSlotContent = !!getCurrentInstance()?.slots?.default
  if (hasSlotContent && props.componente) {
    console.warn(
      '[ColapsableDinamico] ⚠️ Se detectó que se usó simultáneamente el slot y la prop "componente". Se ignorará el componente dinámico y se usará el slot.',
    )
  }
})

defineExpose({
  panelActivo,
})
</script>

<template>
  <VExpansionPanels
    v-model="panelActivo"
    variant="accordion"
    class="expansion-panels-width-border border rounded"
  >
    <VExpansionPanel
      :value="0"
      elevation="0"
    >
      <VExpansionPanelTitle
        :collapse-icon="collapseIcon"
        :expand-icon="expandIcon"
      >
        <div class="d-flex justify-space-between w-100 align-center">
          <span class="d-inline-flex align-center">
            <!-- Ícono opcional antes del título -->
            <VIcon
              v-if="icono"
              :icon="icono"
              :color="iconoColor"
              size="20"
              class="me-2"
            />

            {{ titulo }}
            <VTooltip
              v-if="chipTooltip"
              v-bind="chipTooltipProps"
            >
              <template #activator="{ props: tooltipProps }">
                <VChip
                  v-if="chipTexto"
                  v-bind="tooltipProps"
                  :color="chipColor"
                  class="ml-2"
                  size="small"
                  :label="false"
                  :class="{
                    'cursor-pointer': chipClickable,
                  }"
                  @click.stop="chipClickable && emit('click-chip')"
                >
                  {{ chipTexto }}

                  <VIcon
                    v-if="chipClickable"
                    icon="tabler-pencil"
                    size="16"
                    end
                    class="ml-1"
                  />
                </VChip>
              </template>

              {{ chipTooltip }}
            </VTooltip>

            <VChip
              v-else-if="chipTexto"
              :color="chipColor"
              class="ml-2"
              size="small"
              :label="false"
              :class="{
                'cursor-pointer': chipClickable,
              }"
              @click.stop="chipClickable && emit('click-chip')"
            >
              {{ chipTexto }}

              <VIcon
                v-if="chipClickable"
                icon="tabler-pencil"
                size="16"
                end
                class="ml-1"
              />
            </VChip>
          </span>
          <div
            v-if="$slots.actions"
            class="d-flex align-center"
            @click.stop
          >
            <slot name="actions" />
          </div>
        </div>
      </VExpansionPanelTitle>

      <VExpansionPanelText>
        <slot v-if="$slots.default" />
        <component
          :is="componente"
          v-else-if="componente"
          v-bind="propsComponente"
        />
      </VExpansionPanelText>
    </VExpansionPanel>

    <VOverlay
      :model-value="cargando"
      class="align-center justify-center"
      contained
      persistent
      scroll-strategy="none"
    >
      <div class="overlay-content text-center align-center">
        <VProgressCircular
          class="progress-circle"
          color="primary"
          indeterminate
          size="32"
        />
      </div>
    </VOverlay>
  </VExpansionPanels>
</template>

<style scoped>
.expansion-panels-width-border {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity, 0.12)) !important;
}
</style>

<script setup lang="ts">
import BitacoraComponent from '@/components/bitacora/BitacoraComponent.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  color?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  icon?: string
  text?: string
  density?: 'default' | 'comfortable' | 'compact'
  tooltip?: string
  circular?: boolean
  titulo?: string
  modelId?: string | number | null
  modelType?: string
  modelIdPre?: string | number | null
  modelTypePre?: string | null
  tituloPre?: string
  gestor?: boolean
}>(), {
  color: 'primary',
  variant: 'outlined',
  icon: 'tabler-history',
  text: '',
  density: 'default',
  tooltip: '',
  circular: false,
  titulo: 'Bitácora',
  modelIdPre: null,
  modelTypePre: null,
  tituloPre: 'Bitácora relacionada',
  gestor: false,
})

const mostrarModal = ref(false)

const tieneBitacora = computed(() =>
  props.modelId != null && Boolean(props.modelType),
)

const tieneBitacoraRelacionada = computed(() =>
  props.modelIdPre != null && Boolean(props.modelTypePre),
)
</script>

<template>
  <VBtn
    v-bind="$attrs"
    type="button"
    :color="props.color"
    :variant="props.variant"
    :density="props.density"
    :icon="props.circular"
    :disabled="!tieneBitacora && !tieneBitacoraRelacionada"
    :aria-label="props.tooltip || props.text || props.titulo"
    @click="mostrarModal = true"
  >
    <VIcon
      v-if="props.icon"
      :icon="props.icon"
      :start="!props.circular"
    />

    <span v-if="!props.circular">
      {{ props.text || props.titulo }}
    </span>

    <VTooltip
      v-if="props.tooltip"
      activator="parent"
      location="top"
    >
      {{ props.tooltip }}
    </VTooltip>
  </VBtn>

  <ModalBasico
    v-model:mostrar-modal="mostrarModal"
    :titulo="props.titulo"
    :aria-label="props.titulo"
    max-width="1200"
    scrollable
  >
    <div class="d-flex flex-column ga-4">
      <Colapsable
        v-if="tieneBitacora"
        :key="`${props.modelType}:${props.modelId}`"
        titulo="Historial de cambios"
        abierto
        :componente="BitacoraComponent"
        :props-componente="{
          modelId: props.modelId,
          modelType: props.modelType,
          pageSize: 5,
          bitacoraGestor: props.gestor,
        }"
      />

      <Colapsable
        v-if="tieneBitacoraRelacionada"
        :key="`${props.modelTypePre}:${props.modelIdPre}`"
        :titulo="props.tituloPre"
        :abierto="!tieneBitacora"
        :componente="BitacoraComponent"
        :props-componente="{
          modelId: props.modelIdPre,
          modelType: props.modelTypePre,
          pageSize: 5,
        }"
      />
    </div>
  </ModalBasico>
</template>

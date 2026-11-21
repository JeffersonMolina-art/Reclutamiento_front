<script setup lang="ts">
interface PropsInterface {
  mostrarModal: boolean
  componente?: string | object
  titulo?: string
  subtitulo?: string
  cardProps?: Record<string, any>
}

interface EmitsInterface {
  (e: 'update:mostrarModal', value: boolean): void
  (e: 'cerrarModal', value: boolean): void
}
const props = defineProps<PropsInterface>()
const emit = defineEmits<EmitsInterface>()
const attrs = useAttrs()

const editorFlujoExpandido = ref(false)

provide('editor-flujo-expandido', editorFlujoExpandido)

const obtenerAtributosDialogo = () => {
  if (!editorFlujoExpandido.value)
    return attrs

  return {
    ...attrs,
    retainFocus: false,
    'retain-focus': false,
    persistent: true,
    closeOnBack: false,
    'close-on-back': false,
  }
}

const puedeMostrarModal = computed<boolean>({
  get: () => props.mostrarModal,
  set: (value: boolean) => emit('update:mostrarModal', value),
})

watch(() => props.mostrarModal, (nuevoValor: boolean) => {
  puedeMostrarModal.value = nuevoValor
})

onMounted(() => {
  const hasSlotContent = !!getCurrentInstance()?.slots?.default
  if (hasSlotContent && props.componente) {
    console.warn(
      '[ColapsableDinamico] ⚠️ Se detectó que se usó simultáneamente el slot y la prop "componente". Se ignorará el componente dinámico y se usará el slot.',
    )
  }
})

const cerrarModal = () => {
  puedeMostrarModal.value = false
  emit('cerrarModal')
}
</script>

<template>
  <VDialog
    v-model="puedeMostrarModal"
    :title="titulo || 'Modal Básico'"
    :class="{ 'modal-base-flujo-expandido': editorFlujoExpandido }"
    v-bind="obtenerAtributosDialogo()"
  >
    <DialogCloseBtn @click="cerrarModal" />
    <VCard
      v-bind="props.cardProps"
      :title="props.titulo || 'Modal Básico'"
    >
      <template
        v-if="props.subtitulo"
        #subtitle
      >
        {{ props.subtitulo || 'Subtitulo' }}
      </template>
      <VCardText>
        <slot v-if="$slots.default" />
        <component
          :is="componente"
          v-else-if="componente"
          v-bind="propsComponente"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
:global(.v-overlay.modal-base-flujo-expandido) {
  z-index: 1800 !important;
}
</style>

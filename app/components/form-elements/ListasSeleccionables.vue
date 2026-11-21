<script setup>
const props = defineProps({
  tipo: {
    type: String,
    required: true,
  },
  ItemsDisponibles: {
    type: Array,
    default: () => [],
  },
  ItemsSeleccionadas: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: 'name',
  },
})

const emit = defineEmits([
  'update:ItemsSeleccionadas',
  'itemAgregada',
  'itemQuitada',
])

const disponibles = ref([])
const seleccionadas = ref([])

const searchDisponible = ref('')
const searchSeleccionada = ref('')

const inicializarItems = () => {
  seleccionadas.value = Array.isArray(props.ItemsSeleccionadas) ? [...props.ItemsSeleccionadas] : []
  disponibles.value = Array.isArray(props.ItemsDisponibles)
    ? props.ItemsDisponibles.filter(
      item => !seleccionadas.value.some(sel => sel.id === item.id),
    )
    : []
}

watch(
  () => [props.ItemsDisponibles, props.ItemsSeleccionadas],
  () => {
    inicializarItems()
  },
  {immediate: true, deep: true},
)

const disponiblesFiltrados = computed(() =>
  disponibles.value.filter(item =>
    item[props.label] && item[props.label].toLowerCase().includes(searchDisponible.value.toLowerCase())
  ),
)

const seleccionadasFiltradas = computed(() =>
  seleccionadas.value?.filter(item =>
    item[props.label] && item[props.label].toLowerCase().includes(searchSeleccionada.value?.toLowerCase() || ''),
  ) || [],
)

const seleccionar = item => {
  seleccionadas.value.push(item)
  disponibles.value = disponibles.value.filter(i => i.id !== item.id)
  emit('update:ItemsSeleccionadas', seleccionadas.value)
  emit('itemAgregada', item)
}

const deseleccionar = item => {
  disponibles.value.push(item)
  seleccionadas.value = seleccionadas.value.filter(i => i.id !== item.id)
  emit('update:ItemsSeleccionadas', seleccionadas.value)
  emit('itemQuitada', item)
}

const moverTodosADerecha = () => {
  disponibles.value.forEach(item => emit('itemAgregada', item))
  seleccionadas.value.push(...disponibles.value)
  disponibles.value = []
  emit('update:ItemsSeleccionadas', seleccionadas.value)
}

const moverTodosAIzquierda = () => {
  seleccionadas.value.forEach(item => emit('itemQuitada', item))
  disponibles.value.push(...seleccionadas.value)
  seleccionadas.value = []
  emit('update:ItemsSeleccionadas', seleccionadas.value)
}
</script>

<template>
  <VRow align="stretch" justify="center" class="flex-wrap">
    <VCol cols="12" md="5" class="mb-4 mb-md-0">
      <VCard elevation="3" rounded="lg" class="d-flex flex-column" style="min-height: 400px; max-height: 500px;">
        <VCardTitle class="text-center text-subtitle-1">
          {{ props.tipo }} Disponibles
        </VCardTitle>
        <VCardText class="flex-column flex-grow-1">
          <VTextField
            v-model="searchDisponible"
            :label="`Buscar en ${props.tipo} Disponibles`"
            prepend-inner-icon="tabler-search"
            variant="outlined"
            class="mb-3"
          />
          <div class="flex-grow-1 overflow-y-auto" style="max-height: 350px;">
            <VList v-if="disponiblesFiltrados.length" density="compact" class="pr-1">
              <VListItem
                v-for="item in disponiblesFiltrados"
                :key="item.id"
                class="rounded-lg hover:bg-primary-lighten-5"
              >
                <VListItemTitle class="d-flex align-center justify-between">

                    <span
                      class="px-2 py-1 rounded-lg hover:bg-primary-lighten-5 cursor-pointer"
                      @click="seleccionar(item)"
                    >
                      {{ item[props.label] }}
                    </span>
                  <slot name="item-disponible" :item="item" />
                </VListItemTitle>
              </VListItem>
            </VList>
            <div v-else class="text-center text-medium-emphasis py-2">
              No hay {{ props.tipo }} disponibles.
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <!-- Botones -->
    <VCol cols="12" md="1" class="d-flex flex-row flex-md-column align-center justify-center my-2">
      <VBtn
        icon="tabler-arrow-big-right-lines"
        color="primary"
        variant="outlined"
        class="mb-2 mb-md-4"
        @click="moverTodosADerecha"
      />
      <VBtn
        icon="tabler-arrow-big-left-lines"
        color="primary"
        variant="outlined"
        @click="moverTodosAIzquierda"
      />
    </VCol>

    <!-- Lista seleccionadas -->
    <VCol cols="12" md="5">
      <VCard elevation="3" rounded="lg" class="h-100 d-flex flex-column">
        <VCardTitle class="text-center text-subtitle-1">
          {{ props.tipo }} Seleccionados
        </VCardTitle>
        <VCardText class="flex-column flex-grow-1">
          <VTextField
            v-model="searchSeleccionada"
            :label="`Buscar en ${props.tipo} Seleccionados`"
            prepend-inner-icon="tabler-search"
            variant="outlined"
            class="mb-3"
          />
          <!-- Contenedor de lista con scroll -->
          <div class="overflow-y-auto overflow-x-auto" style="flex-grow: 1; max-height: 300px;">
            <VList
              v-if="seleccionadasFiltradas.length"
              density="compact"
            >
              <VListItem
                v-for="item in seleccionadasFiltradas"
                :key="item.id"
                class="rounded-lg hover:bg-primary-lighten-5"
              >
                <VListItemTitle class="d-flex align-center justify-between">
                    <span
                      class="px-2 py-1 rounded-lg hover:bg-primary-lighten-5 cursor-pointer"
                      @click="deseleccionar(item)"
                    >
                      {{ item[props.label] }}
                    </span>
                  <slot name="item-seleccionado" :item="item"/>
                </VListItemTitle>
              </VListItem>

            </VList>
            <div v-else class="text-center text-medium-emphasis py-2">
              No hay {{ props.tipo }} seleccionados.
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

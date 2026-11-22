<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'
import type { UnidadInterface } from '@/types/catalogos/unidad/types'


interface Emit {
  (e: 'emitirDatos', value: UnidadInterface ): void
}
interface PropsInterface {
  item: UnidadInterface | null
}

const props = defineProps<PropsInterface>()
const isFormValid = ref(false)
const refForm = ref<VForm>()
const emit = defineEmits<Emit>()
const data = ref<UnidadInterface>(
  { codigo: null,
nombre: null,
estado: null,
regiones_id: null,
gerencia_id: null,
}
)

const onSubmit = () => {
  refForm.value?.validate().then(({valid}) => {
    if (valid) {
      emit('emitirDatos', data.value)
    }
  })
}

if (props.item)
  data.value = props.item
</script>

<template>

  <VForm
    ref="refForm"
    v-model="isFormValid"
    @submit.prevent="onSubmit"
  >
    <VRow>
    
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.codigo"
        :rules="[requiredValidator]"
        label="Codigo"
        placeholder="Ingrese Codigo"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.nombre"
        :rules="[requiredValidator]"
        label="Nombre"
        placeholder="Ingrese Nombre"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.estado"
        :rules="[requiredValidator]"
        label="Estado"
        placeholder="Ingrese Estado"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <SelectorPro
        v-model:item-selected="data.regiones_id"
        url="api/catalogo/regiones"
        item-value="id"
        item-title="nombre"
        :campos-a-filtrar="['nombre']"
        label="Regiones"
        placeholder="Seleccione Regiones"
        persistent-placeholder
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <SelectorPro
        v-model:item-selected="data.gerencia_id"
        url="api/catalogo/gerencias"
        item-value="id"
        item-title="nombre"
        :campos-a-filtrar="['nombre']"
        label="Gerencia"
        placeholder="Seleccione Gerencia"
        persistent-placeholder
      />
    </VCol>
  
      <VCol cols="12" md=12 class="text-end">
        <VBtn
          type="reset"
          color="secondary"
          to="/catalogos/unidad"
          class="mr-2"
        >
          <VIcon
            icon="tabler-cancel"
            start size="22"
          />
          Cancelar
        </VBtn>
        <VBtn
          type="submit"
          class="me-3"
        >
          <VIcon
            icon="tabler-device-floppy"
            start size="22"
          />
          Guardar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>

<style scoped lang="scss">

</style>

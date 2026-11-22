<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'
import type { MunicipioInterface } from '@/types/catalogos/municipios/types'


interface Emit {
  (e: 'emitirDatos', value: MunicipioInterface ): void
}
interface PropsInterface {
  item: MunicipioInterface | null
}

const props = defineProps<PropsInterface>()
const isFormValid = ref(false)
const refForm = ref<VForm>()
const emit = defineEmits<Emit>()
const data = ref<MunicipioInterface>(
  {
nombre: null,
estado: null,
departamento_id: null,
existe_agencia: null }
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
        v-model:item-selected="data.departamento_id"
        url="api/catalogo/departamentos"
        item-value="id"
        item-title="nombre"
        :campos-a-filtrar="['nombre']"
        label="Departamento"
        placeholder="Seleccione Departamento"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.existe_agencia"
        :rules="[requiredValidator]"
        label="Existe Agencia"
        placeholder="Ingrese Existe Agencia"
      />
    </VCol>
  
      <VCol cols="12" md=12 class="text-end">
        <VBtn
          type="reset"
          color="secondary"
          to="/catalogos/municipios"
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

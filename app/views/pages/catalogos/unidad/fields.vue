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
emails: null,
estado: null,
regiones_id: null,
gerencia_id: null,
jefe_id: null,
auxiliar_id: null,
municipio_id: null,
departamento_id: null,
latitud: null,
longitud: null }
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
        v-model="data.emails"
        :rules="[requiredValidator]"
        label="Emails"
        placeholder="Ingrese Emails"
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
      <AppTextField
        v-model="data.regiones_id"
        :rules="[requiredValidator]"
        label="Regiones"
        placeholder="Ingrese Regiones"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.gerencia_id"
        :rules="[requiredValidator]"
        label="Gerencia"
        placeholder="Ingrese Gerencia"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.jefe_id"
        :rules="[requiredValidator]"
        label="Jefe"
        placeholder="Ingrese Jefe"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.auxiliar_id"
        :rules="[requiredValidator]"
        label="Auxiliar"
        placeholder="Ingrese Auxiliar"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.municipio_id"
        :rules="[requiredValidator]"
        label="Municipio"
        placeholder="Ingrese Municipio"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.departamento_id"
        :rules="[requiredValidator]"
        label="Departamento"
        placeholder="Ingrese Departamento"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.latitud"
        :rules="[requiredValidator]"
        label="Latitud"
        placeholder="Ingrese Latitud"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.longitud"
        :rules="[requiredValidator]"
        label="Longitud"
        placeholder="Ingrese Longitud"
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

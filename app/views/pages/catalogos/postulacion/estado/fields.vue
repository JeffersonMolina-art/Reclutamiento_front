<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'
import type { PostulacionEstadoInterface } from '@/types/catalogos/postulacion/estado/types'


interface Emit {
  (e: 'emitirDatos', value: PostulacionEstadoInterface ): void
}
interface PropsInterface {
  item: PostulacionEstadoInterface | null
}

const props = defineProps<PropsInterface>()
const isFormValid = ref(false)
const refForm = ref<VForm>()
const emit = defineEmits<Emit>()
const data = ref<PostulacionEstadoInterface>(
  { nombre: null,
bandeja_id: null,
codigo: null }
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
        v-model="data.bandeja_id"
        :rules="[requiredValidator]"
        label="Bandeja"
        placeholder="Ingrese Bandeja"
      />
    </VCol>
  
    <VCol cols="12" md="6">
      <AppTextField
        v-model="data.codigo"
        :rules="[requiredValidator]"
        label="Codigo"
        placeholder="Ingrese Codigo"
      />
    </VCol>
  
      <VCol cols="12" md=12 class="text-end">
        <VBtn
          type="reset"
          color="secondary"
          to="/catalogos/postulacion/estado"
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

<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'
import type { DepartamentoInterface } from '@/types/catalogos/departamento/types'

type DatosDepartamento = Pick<DepartamentoInterface, 'nombre' | 'estado'>

const props = defineProps<{ item: DepartamentoInterface | null }>()
const emit = defineEmits<{ emitirDatos: [value: DatosDepartamento] }>()

const isFormValid = ref(false)
const refForm = ref<VForm>()
const data = ref<DatosDepartamento>({ nombre: null, estado: null })

watch(() => props.item, item => {
  data.value = { nombre: item?.nombre ?? null, estado: item?.estado ?? null }
}, { immediate: true })

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid)
      emit('emitirDatos', { ...data.value })
  })
}
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
  
      <VCol cols="12" md=12 class="text-end">
        <VBtn
          type="reset"
          color="secondary"
          to="/catalogos/departamento"
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

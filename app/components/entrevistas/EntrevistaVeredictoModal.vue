<script setup lang="ts">
import type { EstadoDisponible } from '@/types/entrevistas/types'

const props = defineProps<{
  mostrarModal: boolean
  postulacionId: number | string
  estadosDisponibles: EstadoDisponible[]
}>()

const emit = defineEmits<{
  (e: 'update:mostrarModal', value: boolean): void
  (e: 'guardado'): void
}>()

const { put } = useClienteRequest()
const { showToastSuccess } = useToast()

const guardando = ref(false)
const veredicto = reactive<{ estado_id: number | null; comentario: string; puntaje_fase: number | string | null }>({
  estado_id: null,
  comentario: '',
  puntaje_fase: null,
})

const abierto = computed({
  get: () => props.mostrarModal,
  set: (valor: boolean) => emit('update:mostrarModal', valor),
})

const puedeConfirmar = computed(() => Boolean(veredicto.estado_id) && Boolean(veredicto.comentario.trim()))

watch(() => props.mostrarModal, (valor) => {
  if (valor)
    Object.assign(veredicto, { estado_id: null, comentario: '', puntaje_fase: null })
})

async function darVeredicto() {
  if (!puedeConfirmar.value || guardando.value)
    return

  guardando.value = true

  try {
    const payload: Record<string, any> = {
      estado_id: veredicto.estado_id,
      comentario: veredicto.comentario.trim(),
    }

    if (veredicto.puntaje_fase !== null && veredicto.puntaje_fase !== '')
      payload.puntaje_fase = Number(veredicto.puntaje_fase)

    await put(`api/reclutamiento/postulaciones/${props.postulacionId}`, payload)
    showToastSuccess('Veredicto registrado')
    abierto.value = false
    emit('guardado')
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    guardando.value = false
  }
}
</script>

<template>
  <ModalBasico
    v-model:mostrar-modal="abierto"
    titulo="Dar veredicto"
    max-width="500"
    :persistent="guardando"
  >
    <VRow>
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="veredicto.estado_id"
          label="Siguiente paso"
          :items="estadosDisponibles"
          item-title="nombre"
          item-value="id"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="veredicto.puntaje_fase"
          label="Puntaje de esta fase"
          type="number"
        />
      </VCol>
      <VCol cols="12">
        <AppTextarea
          v-model="veredicto.comentario"
          label="Comentario"
          maxlength="255"
          counter
          rows="3"
        />
      </VCol>
    </VRow>

    <div class="d-flex justify-end gap-2 mt-4">
      <VBtn
        variant="text"
        :disabled="guardando"
        @click="abierto = false"
      >
        Cancelar
      </VBtn>
      <VBtn
        color="success"
        :loading="guardando"
        :disabled="!puedeConfirmar"
        @click="darVeredicto"
      >
        Confirmar
      </VBtn>
    </div>
  </ModalBasico>
</template>

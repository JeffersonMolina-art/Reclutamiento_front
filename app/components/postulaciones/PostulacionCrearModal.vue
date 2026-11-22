<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [valor: boolean]
  'creada': []
}>()

const { post } = useClienteRequest()
const { showToastSuccess } = useToast()

const abierto = computed({
  get: () => props.modelValue,
  set: valor => emit('update:modelValue', valor),
})

const refFormulario = ref()
const guardando = ref(false)
const vacanteId = ref<number | null>(null)
const candidatoCreadoId = ref<number | null>(null)
const panelesAbiertos = ref<string[]>(['datos'])

const crearCandidatoVacio = () => ({
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  dpi: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  expectativa_salarial: '' as number | string,
})

const crearConocimiento = () => ({ descripcion: '', nivel: '' })
const crearExperiencia = () => ({ empresa: '', puesto: '', fecha_inicio: '', fecha_fin: '' })
const crearFormacion = () => ({ nombre: '', titulo_carrera: '', fecha_inicio: '', fecha_fin: '' })

const candidatoNuevo = ref(crearCandidatoVacio())
const conocimientos = ref([crearConocimiento()])
const experiencias = ref([crearExperiencia()])
const formaciones = ref([crearFormacion()])

watch(abierto, valor => {
  if (!valor)
    return

  vacanteId.value = null
  candidatoCreadoId.value = null
  panelesAbiertos.value = ['datos']
  candidatoNuevo.value = crearCandidatoVacio()
  conocimientos.value = [crearConocimiento()]
  experiencias.value = [crearExperiencia()]
  formaciones.value = [crearFormacion()]
  refFormulario.value?.resetValidation()
})

const limpiarOpcionales = <T extends Record<string, string>>(item: T) =>
  Object.fromEntries(Object.entries(item).map(([clave, valor]) => [clave, valor.trim()]).filter(([, valor]) => valor))

function armarPayloadCandidato() {
  const candidato = candidatoNuevo.value

  const payload: Record<string, any> = {
    primer_nombre: candidato.primer_nombre.trim(),
    primer_apellido: candidato.primer_apellido.trim(),
    dpi: candidato.dpi.replace(/\s/g, ''),
    email: candidato.email.trim().toLowerCase(),
    telefono: candidato.telefono.replace(/[\s-]/g, ''),
    fecha_nacimiento: candidato.fecha_nacimiento,
    expectativa_salarial: Number(candidato.expectativa_salarial),
    conocimientos: conocimientos.value.map(limpiarOpcionales),
    experiencias: experiencias.value.map(limpiarOpcionales),
    formaciones: formaciones.value.map(limpiarOpcionales),
  }

  for (const campo of ['segundo_nombre', 'tercer_nombre', 'segundo_apellido'] as const) {
    const valor = candidato[campo].trim()

    if (valor)
      payload[campo] = valor
  }

  return payload
}

async function obtenerIdDelCandidato(): Promise<number> {
  if (candidatoCreadoId.value)
    return candidatoCreadoId.value

  const respuesta = await post<SendResponseInterface<{ id: number }>>(
    'api/reclutamiento/candidatos',
    armarPayloadCandidato(),
  )

  candidatoCreadoId.value = respuesta.data.id

  return candidatoCreadoId.value
}

async function guardar() {
  if (guardando.value || !vacanteId.value)
    return

  const resultado = await refFormulario.value?.validate()

  if (!resultado?.valid) {
    panelesAbiertos.value = ['datos', 'conocimientos', 'experiencias', 'formaciones']

    return
  }

  guardando.value = true

  try {
    const candidatoId = await obtenerIdDelCandidato()

    await post<SendResponseInterface<unknown>>('api/reclutamiento/postulaciones', {
      vacante_id: vacanteId.value,
      candidato_id: candidatoId,
    })

    showToastSuccess('Postulación creada con éxito.')
    abierto.value = false
    emit('creada')
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
    titulo="Nueva postulación"
    max-width="820"
    :persistent="guardando"
  >
    <VForm
      ref="refFormulario"
      :readonly="!!candidatoCreadoId"
      @submit.prevent="guardar"
    >
      <div class="mb-4">
        <VLabel class="mb-2">
          Vacante
        </VLabel>
        <SelectorPro
          v-model:item-selected="vacanteId"
          url="api/reclutamiento/vacantes"
          item-value="id"
          item-title="nombre"
          :campos-a-filtrar="['nombre']"
        />
      </div>

      <VAlert
        v-if="candidatoCreadoId"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        El candidato ya fue creado. Al reintentar solo se creará la postulación.
      </VAlert>

      <VExpansionPanels
        v-model="panelesAbiertos"
        multiple
        variant="accordion"
      >
        <PostulacionCandidatoDatos v-model="candidatoNuevo" />
        <PostulacionCandidatoConocimientos v-model="conocimientos" />
        <PostulacionCandidatoExperiencias v-model="experiencias" />
        <PostulacionCandidatoFormaciones v-model="formaciones" />
      </VExpansionPanels>

      <VDivider class="my-4" />

      <div class="d-flex justify-end ga-2">
        <VBtn
          variant="text"
          :disabled="guardando"
          @click="abierto = false"
        >
          Cancelar
        </VBtn>
        <VBtn
          type="submit"
          color="primary"
          variant="elevated"
          :loading="guardando"
          :disabled="!vacanteId"
        >
          Guardar
        </VBtn>
      </div>
    </VForm>
  </ModalBasico>
</template>

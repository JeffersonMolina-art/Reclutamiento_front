<script setup lang="ts">
import type { SendResponseInterface } from '@/types/sistema/types'
import type { ContactoCandidato, Entrevista } from '@/types/entrevistas/types'
import { MODALIDADES_ENTREVISTA, TIPOS_ENTREVISTA } from '@/constantes/Entrevistas'

const props = defineProps<{
  mostrarModal: boolean
  postulacionId: number | string
}>()

const emit = defineEmits<{
  (e: 'update:mostrarModal', value: boolean): void
  (e: 'agendada', value: Entrevista): void
}>()

const { get, post } = useClienteRequest()
const { showToastSuccess } = useToast()

const guardando = ref(false)
const cargandoContacto = ref(false)
const contacto = ref<ContactoCandidato | null>(null)

const formulario = reactive({
  fecha_hora_programada: '',
  modalidad: 'presencial' as Entrevista['modalidad'],
  ubicacion_o_enlace: '',
  tipo_entrevista: null as string | null,
  entrevistador_id: null as number | null,
  observaciones: '',
})

const abierto = computed({
  get: () => props.mostrarModal,
  set: (valor: boolean) => emit('update:mostrarModal', valor),
})

const esVirtual = computed(() => formulario.modalidad === 'virtual')

watch(() => props.mostrarModal, (valor) => {
  if (valor)
    cargarContacto()
})

async function cargarContacto() {
  if (contacto.value)
    return

  cargandoContacto.value = true

  try {
    const respuesta = await get<SendResponseInterface<ContactoCandidato>>(`api/reclutamiento/postulaciones/${props.postulacionId}/contacto`)

    contacto.value = respuesta.data
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    cargandoContacto.value = false
  }
}

function reiniciarFormulario() {
  formulario.fecha_hora_programada = ''
  formulario.ubicacion_o_enlace = ''
  formulario.tipo_entrevista = null
  formulario.entrevistador_id = null
  formulario.observaciones = ''
}

async function agendarEntrevista() {
  if (guardando.value)
    return

  guardando.value = true

  try {
    const respuesta = await post<SendResponseInterface<Entrevista>>(
      `api/reclutamiento/postulaciones/${props.postulacionId}/entrevistas`,
      {
        ...formulario,
        fecha_hora_programada: formulario.fecha_hora_programada.replace('T', ' '),
        ubicacion_o_enlace: formulario.ubicacion_o_enlace.trim(),
        observaciones: formulario.observaciones.trim() || null,
      },
    )

    reiniciarFormulario()
    showToastSuccess('Entrevista programada con éxito.')
    abierto.value = false
    emit('agendada', respuesta.data)
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
    titulo="Agendar entrevista"
    max-width="640"
    :persistent="guardando"
  >
    <form @submit.prevent="agendarEntrevista">
      <VProgressLinear
        v-if="cargandoContacto"
        indeterminate
        class="mb-4"
      />

      <div
        v-else-if="contacto"
        class="entrevista-agendar__contacto mb-4 pa-3"
      >
        <div class="text-subtitle-2">
          {{ contacto.nombre }}
        </div>
        <div class="d-flex flex-wrap ga-3 text-body-2">
          <a
            v-if="contacto.correo"
            :href="`mailto:${contacto.correo}`"
          >
            {{ contacto.correo }}
          </a>
          <a
            v-if="contacto.telefono"
            :href="`tel:${contacto.telefono}`"
          >
            {{ contacto.telefono }}
          </a>
          <span
            v-if="!contacto.correo && !contacto.telefono"
            class="text-medium-emphasis"
          >
            Sin datos de contacto
          </span>
        </div>
      </div>

      <VRow dense>
        <VCol
          cols="12"
          sm="6"
        >
          <VSelect
            v-model="formulario.tipo_entrevista"
            :items="TIPOS_ENTREVISTA"
            label="Tipo de entrevista"
            required
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
        >
          <SelectorPro
            v-model:item-selected="formulario.entrevistador_id"
            url="api/users"
            item-value="id"
            item-title="nombre_completo"
            :campos-a-filtrar="['buscarPorNombre']"
            label="Entrevistador (por defecto, tú)"
            clearable
          />
        </VCol>

        <VCol
          cols="12"
          sm="7"
        >
          <VTextField
            v-model="formulario.fecha_hora_programada"
            type="datetime-local"
            label="Fecha y hora"
            hint="Hora de Guatemala"
            persistent-hint
            required
          />
        </VCol>

        <VCol
          cols="12"
          sm="5"
        >
          <VSelect
            v-model="formulario.modalidad"
            :items="MODALIDADES_ENTREVISTA"
            label="Modalidad"
            @update:model-value="formulario.ubicacion_o_enlace = ''"
          />
        </VCol>

        <VCol cols="12">
          <VTextField
            v-model="formulario.ubicacion_o_enlace"
            :label="esVirtual ? 'Enlace de Google Meet' : 'Lugar de la entrevista'"
            :type="esVirtual ? 'url' : 'text'"
            maxlength="500"
            required
          />

          <VBtn
            v-if="esVirtual"
            href="https://meet.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            color="primary"
            size="small"
            append-icon="tabler-external-link"
            class="mb-2"
          >
            Abrir Google Meet
          </VBtn>
        </VCol>

        <VCol cols="12">
          <VTextarea
            v-model="formulario.observaciones"
            label="Observaciones"
            rows="2"
            maxlength="255"
            hide-details="auto"
          />
        </VCol>
      </VRow>

      <div class="d-flex justify-end gap-2 mt-4">
        <VBtn
          type="button"
          variant="text"
          :disabled="guardando"
          @click="abierto = false"
        >
          Cancelar
        </VBtn>

        <VBtn
          type="submit"
          color="primary"
          variant="flat"
          :loading="guardando"
        >
          Agendar entrevista
        </VBtn>
      </div>
    </form>
  </ModalBasico>
</template>

<style scoped>
.entrevista-agendar__contacto {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 8px;
  overflow-wrap: anywhere;
}
</style>

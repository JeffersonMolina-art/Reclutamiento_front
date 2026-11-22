<script setup lang="ts">
interface OfertaCandidato {
  salario_ofrecido: number | string
  fecha_inicio_propuesta: string
  condiciones_oferta: string
  estado_oferta: 'pendiente' | 'aceptada' | 'rechazada'
  fecha_respuesta_oferta: string | null
  motivo_rechazo_oferta: string | null
}

const props = defineProps<{
  mostrarModal: boolean
  postulacionId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:mostrarModal', value: boolean): void
  (e: 'respondida', value: OfertaCandidato): void
}>()

const { peticion } = useCandidatoSesion()

const cargandoOferta = ref(false)
const respondiendo = ref(false)
const errorOferta = ref('')
const oferta = ref<OfertaCandidato | null>(null)
const rechazando = ref(false)
const motivoRechazo = ref('')

const formatoMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

const estadosOferta = {
  pendiente: { texto: 'Pendiente de tu respuesta', color: 'warning' },
  aceptada: { texto: 'Aceptaste esta oferta', color: 'success' },
  rechazada: { texto: 'Rechazaste esta oferta', color: 'error' },
}

const abierto = computed({
  get: () => props.mostrarModal,
  set: (valor: boolean) => emit('update:mostrarModal', valor),
})

const puedeResponder = computed(() =>
  oferta.value?.estado_oferta === 'pendiente' && !cargandoOferta.value && !errorOferta.value,
)

watch(() => props.mostrarModal, (valor) => {
  if (valor && props.postulacionId)
    cargarOferta(props.postulacionId)
})

async function cargarOferta(id: number) {
  oferta.value = null
  errorOferta.value = ''
  rechazando.value = false
  motivoRechazo.value = ''
  cargandoOferta.value = true

  try {
    const respuesta = await peticion<{ data: OfertaCandidato | null }>(`/api/portal/postulaciones/${id}/oferta`)

    oferta.value = respuesta.data
  }
  catch {
    errorOferta.value = 'No se pudo cargar la oferta.'
  }
  finally {
    cargandoOferta.value = false
  }
}

async function responderOferta(respuesta: 'aceptada' | 'rechazada') {
  if (respondiendo.value || (respuesta === 'rechazada' && !motivoRechazo.value.trim()))
    return

  respondiendo.value = true
  errorOferta.value = ''

  try {
    const resultado = await peticion<{ data: OfertaCandidato }>(
      `/api/portal/postulaciones/${props.postulacionId}/oferta/responder`,
      {
        method: 'POST',
        body: {
          respuesta,
          motivo_rechazo_oferta: respuesta === 'rechazada' ? motivoRechazo.value.trim() : null,
        },
      },
    )

    oferta.value = resultado.data
    rechazando.value = false
    emit('respondida', resultado.data)
  }
  catch (error: any) {
    errorOferta.value = error?.data?.message ?? 'No se pudo registrar tu respuesta.'
  }
  finally {
    respondiendo.value = false
  }
}
</script>

<template>
  <ModalBasico
    v-model:mostrar-modal="abierto"
    titulo="Oferta de empleo"
    max-width="600"
    :persistent="respondiendo"
  >
    <VProgressLinear
      v-if="cargandoOferta"
      color="primary"
      indeterminate
      class="mb-4"
    />

    <VAlert
      v-else-if="errorOferta"
      type="error"
      variant="tonal"
    >
      {{ errorOferta }}
    </VAlert>

    <VAlert
      v-else-if="!oferta"
      type="info"
      variant="tonal"
    >
      Todavía no hay una oferta para esta postulación.
    </VAlert>

    <template v-else>
      <VChip
        :color="estadosOferta[oferta.estado_oferta].color"
        variant="tonal"
        size="small"
        label
        class="mb-4"
      >
        {{ estadosOferta[oferta.estado_oferta].texto }}
      </VChip>

      <VCard
        variant="outlined"
        rounded="lg"
        class="mb-5"
      >
        <VCardText class="pa-4">
          <VRow>
            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center ga-3">
                <VAvatar
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  size="40"
                >
                  <VIcon
                    icon="tabler-wallet"
                    size="20"
                  />
                </VAvatar>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Salario ofrecido
                  </div>
                  <div class="text-h6 font-weight-bold">
                    {{ formatoMoneda.format(Number(oferta.salario_ofrecido)) }}
                  </div>
                </div>
              </div>
            </VCol>

            <VCol
              cols="12"
              sm="6"
            >
              <div class="d-flex align-center ga-3">
                <VAvatar
                  color="primary"
                  variant="tonal"
                  rounded="lg"
                  size="40"
                >
                  <VIcon
                    icon="tabler-calendar-event"
                    size="20"
                  />
                </VAvatar>

                <div>
                  <div class="text-caption text-medium-emphasis">
                    Fecha de inicio propuesta
                  </div>
                  <div class="text-body-1 font-weight-medium">
                    {{ oferta.fecha_inicio_propuesta || 'Por definir' }}
                  </div>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <section class="mb-5">
        <h3 class="text-subtitle-1 font-weight-bold mb-2">
          Condiciones de la oferta
        </h3>
        <p class="text-body-2 text-medium-emphasis text-pre-wrap text-break mb-0">
          {{ oferta.condiciones_oferta || 'Sin condiciones adicionales.' }}
        </p>
      </section>

      <VAlert
        v-if="oferta.motivo_rechazo_oferta"
        title="Motivo del rechazo"
        color="error"
        icon="tabler-message-circle"
        variant="tonal"
        class="mb-4"
      >
        <p class="text-body-2 text-pre-wrap text-break mb-0">
          {{ oferta.motivo_rechazo_oferta }}
        </p>
      </VAlert>

      <VTextarea
        v-if="oferta.estado_oferta === 'pendiente' && rechazando"
        v-model="motivoRechazo"
        label="Motivo del rechazo"
        rows="3"
        maxlength="255"
        :disabled="respondiendo"
        counter
        auto-grow
        class="mb-4"
      />
    </template>

    <VDivider class="mt-4" />

    <div class="d-flex flex-wrap justify-end align-center ga-2 pt-4">
      <VBtn
        v-if="puedeResponder && rechazando"
        variant="text"
        color="secondary"
        prepend-icon="tabler-arrow-left"
        :disabled="respondiendo"
        @click="rechazando = false"
      >
        Volver
      </VBtn>

      <VBtn
        v-else
        variant="text"
        color="secondary"
        :disabled="respondiendo"
        @click="abierto = false"
      >
        Cerrar
      </VBtn>

      <template v-if="puedeResponder">
        <template v-if="!rechazando">
          <VBtn
            variant="tonal"
            color="error"
            :disabled="respondiendo"
            @click="rechazando = true"
          >
            Rechazar oferta
          </VBtn>

          <VBtn
            variant="flat"
            color="success"
            prepend-icon="tabler-check"
            :loading="respondiendo"
            @click="responderOferta('aceptada')"
          >
            Aceptar oferta
          </VBtn>
        </template>

        <VBtn
          v-else
          variant="flat"
          color="error"
          :loading="respondiendo"
          :disabled="!motivoRechazo.trim()"
          @click="responderOferta('rechazada')"
        >
          Confirmar rechazo
        </VBtn>
      </template>
    </div>
  </ModalBasico>
</template>

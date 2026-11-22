<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'

type Recurso = 'conocimientos' | 'experiencias' | 'formaciones'

const props = defineProps<{
  recurso: Recurso
  item: any | null
  mostrar: boolean
}>()

const emit = defineEmits<{
  'update:mostrar': [valor: boolean]
  'guardado': []
}>()

const { peticion, token } = useCandidatoSesion()
const { showToastSuccess, showToastError } = useToast()
const mensajeError = (error: any, base: string) => {
  const errores = error?.data?.errors
  const primero = errores ? (Object.values(errores)[0] as string[] | undefined)?.[0] : null

  return primero ?? error?.data?.message ?? base
}

const sesionExpirada = async (error: any) => {
  const estado = error?.statusCode ?? error?.response?.status

  if (estado !== 401 && estado !== 403)
    return false

  token.value = null
  await navigateTo('/reclutamiento/login')

  return true
}

const refFormItem = ref<VForm>()
const guardandoItem = ref(false)
const actual = ref(false)
const form = ref<Record<string, any>>({})

const niveles = ['Básico', 'Intermedio', 'Avanzado', 'Experto']
const hoy = new Date().toISOString().slice(0, 10)

const titulos: Record<Recurso, string> = {
  conocimientos: 'conocimiento',
  experiencias: 'experiencia laboral',
  formaciones: 'formación académica',
}

const abierto = computed({
  get: () => props.mostrar,
  set: valor => emit('update:mostrar', valor),
})

watch(() => props.mostrar, mostrar => {
  if (!mostrar)
    return

  const item = props.item

  form.value = item ? { ...item } : {}

  if (item) {
    delete form.value.id
    form.value.fecha_inicio = item.fecha_inicio?.slice(0, 10)
    form.value.fecha_fin = item.fecha_fin?.slice(0, 10) ?? null
  }

  actual.value = !!item && props.recurso !== 'conocimientos' && !item.fecha_fin
})

watch(actual, anterior => {
  if (anterior)
    form.value.fecha_fin = null
})

async function guardarItem() {
  const { valid } = await refFormItem.value!.validate()

  if (!valid || guardandoItem.value)
    return

  guardandoItem.value = true

  try {
    const base = `/api/portal/perfil/${props.recurso}`
    const itemId = props.item?.id ?? null
    const cuerpo = { ...form.value, fecha_fin: actual.value ? null : (form.value.fecha_fin || null) }

    const respuesta = await peticion<{ message: string }>(itemId ? `${base}/${itemId}` : base, {
      method: itemId ? 'PUT' : 'POST',
      body: cuerpo,
    })

    showToastSuccess(respuesta.message)
    abierto.value = false
    emit('guardado')
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudo guardar el registro'))
  }
  finally {
    guardandoItem.value = false
  }
}
</script>

<template>
  <ModalBasico
    v-model:mostrar-modal="abierto"
    :titulo="(item ? 'Editar ' : 'Agregar ') + titulos[recurso]"
    :aria-label="(item ? 'Editar ' : 'Agregar ') + titulos[recurso]"
    :card-props="{ rounded: 'xl' }"
    :persistent="guardandoItem"
    max-width="560"
    scrollable
  >
    <VForm
      ref="refFormItem"
      class="trayectoria-formulario"
      :disabled="guardandoItem"
      @submit.prevent="guardarItem"
    >
      <VRow>
        <template v-if="recurso === 'conocimientos'">
          <VCol cols="12">
            <AppTextField
              v-model="form.descripcion"
              :rules="[requiredValidator]"
              label="Conocimiento o habilidad"
              placeholder="Ej. Microsoft Excel"
              prepend-inner-icon="tabler-bulb"
              maxlength="255"
            />
          </VCol>

          <VCol cols="12">
            <AppSelect
              v-model="form.nivel"
              :items="niveles"
              label="Nivel (opcional)"
              clearable
            />
          </VCol>
        </template>

        <template v-else>
          <VCol cols="12">
            <AppTextField
              v-if="recurso === 'experiencias'"
              key="empresa"
              v-model="form.empresa"
              :rules="[requiredValidator]"
              label="Empresa"
              prepend-inner-icon="tabler-building"
              maxlength="255"
            />
            <AppTextField
              v-else
              key="institucion"
              v-model="form.nombre"
              :rules="[requiredValidator]"
              label="Institución"
              prepend-inner-icon="tabler-school"
              maxlength="255"
            />
          </VCol>

          <VCol cols="12">
            <AppTextField
              v-if="recurso === 'experiencias'"
              key="puesto"
              v-model="form.puesto"
              label="Puesto (opcional)"
              maxlength="45"
            />
            <AppTextField
              v-else
              key="carrera"
              v-model="form.titulo_carrera"
              label="Título o carrera (opcional)"
              maxlength="255"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
          >
            <AppTextField
              v-model="form.fecha_inicio"
              :rules="[requiredValidator]"
              label="Fecha de inicio"
              type="date"
              :max="hoy"
            />
          </VCol>

          <VCol
            cols="12"
            sm="6"
          >
            <AppTextField
              v-model="form.fecha_fin"
              label="Fecha de fin"
              type="date"
              :min="form.fecha_inicio"
              :max="hoy"
              :disabled="actual"
            />
          </VCol>

          <VCol cols="12">
            <div class="trayectoria-actual">
              <VCheckbox
                v-model="actual"
                color="primary"
                density="compact"
                :label="recurso === 'experiencias' ? 'Trabajo aquí actualmente' : 'Estudio aquí actualmente'"
                hide-details
              />
            </div>
          </VCol>
        </template>
      </VRow>

      <div class="trayectoria-formulario-acciones">
        <VBtn
          type="button"
          variant="text"
          :disabled="guardandoItem"
          @click="abierto = false"
        >
          Cancelar
        </VBtn>

        <VBtn
          type="submit"
          color="primary"
          variant="flat"
          prepend-icon="tabler-device-floppy"
          :loading="guardandoItem"
          :disabled="guardandoItem"
        >
          Guardar
        </VBtn>
      </div>
    </VForm>
  </ModalBasico>
</template>

<style scoped>
.trayectoria-formulario {
  padding-block-start: 0.25rem;
}

.trayectoria-actual {
  padding-inline: 0.75rem;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.06);
}

.trayectoria-formulario-acciones {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-block-start: 1rem;
  margin-block-start: 1.25rem;
  border-block-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>

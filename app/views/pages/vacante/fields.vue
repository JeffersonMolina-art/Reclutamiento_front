<script setup lang="ts">
import type { VForm } from 'vuetify/lib/components/VForm'
import type { VacanteInterface } from '@/types/vacante/types'

const props = defineProps<{
  item: VacanteInterface | null
}>()

const emit = defineEmits<{
  emitirDatos: [value: VacanteInterface]
}>()

const refForm = ref<VForm>()

const crearFormulario = (): VacanteInterface => ({
  estado_id: null,
  puesto_id: null,
  sede_id: null,
  nombre: null,
  descripcion: null,
  cantidad_plazas: null,
  user_id: null,
  fecha_publicacion: null,
  user_encargado: null,
  modalidad_trabajo: null,
  salario_minimo: null,
  salario_maximo: null,
  requisitos: [],
  caracteristicas: [],
})

const data = ref<VacanteInterface>(crearFormulario())

watch(() => props.item, item => {
  data.value = {
    ...crearFormulario(),
    ...item,
    fecha_publicacion: item?.fecha_publicacion?.slice(0, 10) ?? null,
    requisitos: item
      ? item.requisitos?.map(fila => ({ ...fila }))
      : [],
    caracteristicas: item
      ? item.caracteristicas?.map(fila => ({ ...fila }))
      : [],
  }

  refForm.value?.resetValidation()
}, { immediate: true })

function agregarRequisito() {
  data.value.requisitos?.push({
    nombre: '',
    es_obligatorio: false,
  })
}

function agregarCaracteristica() {
  data.value.caracteristicas?.push({
    nombre: '',
    valor: '',
  })
}

const clavesFilas = new WeakMap<object, number>()
let siguienteClave = 0

function claveFila(fila: object): number {
  const existente = clavesFilas.get(fila)

  if (existente !== undefined)
    return existente

  const clave = siguienteClave++

  clavesFilas.set(fila, clave)

  return clave
}

const modalidades = [
  { title: 'Presencial', value: 'presencial' },
  { title: 'Remoto', value: 'remoto' },
  { title: 'Híbrido', value: 'hibrido' },
]

const validarPlazas = (valor: unknown) =>
  /^[1-9]\d*$/.test(String(valor ?? ''))
  || 'Ingresa una cantidad entera mayor a cero.'

const validarSalario = (valor: unknown) =>
  /^\d+(?:\.\d{1,2})?$/.test(String(valor ?? '').trim())
  || 'Ingresa un monto mayor o igual a cero, con hasta dos decimales.'

const validarRango = (valor: unknown) =>
  validarSalario(valor) !== true
  || validarSalario(data.value.salario_minimo) !== true
  || Number(valor) >= Number(data.value.salario_minimo)
  || 'El salario máximo debe ser mayor o igual al mínimo.'

async function onSubmit() {
  const resultado = await refForm.value?.validate()

  if (!resultado?.valid)
    return

  emit('emitirDatos', { ...data.value })
}
</script>

<template>
  <VForm ref="refForm" @submit.prevent="onSubmit">
    <VRow>

      <VCol cols="12">
        <AppTextField
          v-model="data.nombre"
          :rules="[requiredValidator]"
          label="Título de la vacante"
          placeholder="Ej. Analista de Reclutamiento"
        />
      </VCol>

      <VCol cols="12" md="4">
        <SelectorPro
          v-model:item-selected="data.puesto_id"
          url="/api/catalogo/puestos"
          item-value="id"
          item-title="nombre"
          label="Puesto"
          :campos-a-filtrar="['nombre']"
          :rules="[requiredValidator]"
          placeholder="Busca un puesto"
          persistent-placeholder
        />
      </VCol>

      <VCol cols="12" md="4">
        <SelectorPro
          v-model:item-selected="data.sede_id"
          url="/api/catalogo/sede"
          item-value="id"
          item-title="nombre"
          :campos-a-filtrar="['nombre']"
          :rules="[requiredValidator]"
          label="Sede o ubicación"
          placeholder="Busca una sede"
          persistent-placeholder
        />
      </VCol>

      <VCol cols="12" md="4">
        <SelectorPro
          v-model:item-selected="data.user_encargado"
          url="/api/users"
          item-value="id"
          item-title="nombre_completo"
          :filtros="{ reclutadores: 1 }"
          :campos-a-filtrar="['buscarPorNombre']"
          label="Encargado de la vacante"
          placeholder="Busca un reclutador"
          persistent-placeholder
          persistent-clear
        />
      </VCol>
      <VCol cols="12" md="4">
        <SelectorPro
          v-model:item-selected="data.estado_id"
          url="/api/catalogo/vacantes_estados"
          item-value="id"
          item-title="nombre"
          :campos-a-filtrar="['nombre']"
          :rules="[requiredValidator]"
          label="Estado de la vacante"
          placeholder="Selecciona un estado"
          persistent-placeholder
        />
      </VCol>
      <VCol cols="12" md="4">
        <AppSelect
          v-model="data.modalidad_trabajo"
          :items="modalidades"
          :rules="[requiredValidator]"
          label="Modalidad de trabajo"
        />
      </VCol>

      <VCol cols="12" md="4">
        <AppTextField
          v-model="data.cantidad_plazas"
          type="number"
          min="1"
          step="1"
          :rules="[validarPlazas]"
          label="Cantidad de plazas"
        />
      </VCol>

      <VCol cols="12" md="6">
        <AppTextField
          v-model="data.salario_minimo"
          type="number"
          min="0"
          step="0.01"
          prefix="Q"
          :rules="[validarSalario]"
          label="Salario mínimo"
        />
      </VCol>

      <VCol cols="12" md="6">
        <AppTextField
          v-model="data.salario_maximo"
          type="number"
          min="0"
          step="0.01"
          prefix="Q"
          :rules="[validarSalario, validarRango]"
          label="Salario máximo"
        />
      </VCol>

      <VCol cols="12" md="6">
        <AppTextField
          v-model="data.fecha_publicacion"
          type="date"
          label="Fecha de publicación"
        />
      </VCol>

      <VCol cols="12">
        <VTextarea
          v-model="data.descripcion"
          :rules="[requiredValidator]"
          label="Descripción del puesto"
          placeholder="Describe las responsabilidades principales."
          variant="outlined"
          rows="4"
          auto-grow
        />
      </VCol>

      <!-- REQUISITOS -->
      <VCol v-if="data.requisitos !== undefined" cols="12">
        <VCard variant="outlined" rounded="lg">
          <VCardText>
            <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold">
                <VIcon icon="tabler-list-check" class="me-1" />
                Requisitos
              </h3>

              <VBtn
                type="button"
                variant="tonal"
                color="primary"
                prepend-icon="tabler-plus"
                @click="agregarRequisito"
              >
                Agregar requisito
              </VBtn>
            </div>

            <p v-if="!data.requisitos.length" class="text-medium-emphasis mb-0">
              Aún no hay requisitos.
            </p>

            <ul v-else class="list-none pa-0 ma-0">
              <li
                v-for="(requisito, indice) in data.requisitos"
                :key="requisito.id ?? `requisito-nuevo-${indice}`"
                class="border rounded-lg pa-3 mb-2"
              >
                <VRow align="center" dense>
                  <VCol cols="12" md>
                    <AppTextField
                      v-model.trim="requisito.nombre"
                      :rules="[requiredValidator]"
                      label="Requisito"
                      placeholder="Ej. Experiencia en reclutamiento"
                      maxlength="255"
                      hide-details="auto"
                    />
                  </VCol>

                  <VCol cols="auto">
                    <VCheckbox
                      v-model="requisito.es_obligatorio"
                      label="Obligatorio"
                      color="primary"
                      hide-details
                    />
                  </VCol>

                  <VCol cols="auto">
                    <VBtn
                      type="button"
                      icon="tabler-trash"
                      color="error"
                      variant="text"
                      aria-label="Quitar requisito"
                      @click="data.requisitos?.splice(indice, 1)"
                    />
                  </VCol>
                </VRow>
              </li>
            </ul>
          </VCardText>
        </VCard>
      </VCol>
      <!-- CARACTERÍSTICAS -->
      <VCol v-if="data.caracteristicas !== undefined" cols="12">
        <VCard variant="outlined" rounded="lg">
          <VCardText>
            <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
              <h3 class="text-subtitle-1 font-weight-bold">
                <VIcon icon="tabler-list-details" class="me-1" />
                Características
              </h3>

              <VBtn
                type="button"
                variant="tonal"
                color="primary"
                prepend-icon="tabler-plus"
                @click="agregarCaracteristica"
              >
                Agregar característica
              </VBtn>
            </div>

            <p v-if="!data.caracteristicas.length" class="text-medium-emphasis mb-0">
              Aún no hay características.
            </p>

            <ul v-else class="list-none pa-0 ma-0">
              <li
                v-for="(caracteristica, indice) in data.caracteristicas"
                :key="caracteristica.id ?? `caracteristica-nueva-${indice}`"
                class="border rounded-lg pa-3 mb-2"
              >
                <VRow align="center" dense>
                  <VCol cols="12" md>
                    <AppTextField
                      v-model.trim="caracteristica.nombre"
                      :rules="[requiredValidator]"
                      label="Característica"
                      placeholder="Ej. Horario"
                      maxlength="255"
                      hide-details="auto"
                    />
                  </VCol>

                  <VCol cols="10" md>
                    <AppTextField
                      v-model.trim="caracteristica.valor"
                      :rules="[requiredValidator]"
                      label="Valor"
                      placeholder="Ej. Lunes a viernes"
                      maxlength="45"
                      hide-details="auto"
                    />
                  </VCol>

                  <VCol cols="auto">
                    <VBtn
                      type="button"
                      icon="tabler-trash"
                      color="error"
                      variant="text"
                      aria-label="Quitar característica"
                      @click="data.caracteristicas?.splice(indice, 1)"
                    />
                  </VCol>
                </VRow>
              </li>
            </ul>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" class="d-flex flex-wrap justify-end ga-2">
        <VBtn type="button" variant="text" color="secondary" to="/vacante">
          Cancelar
        </VBtn>

        <VBtn
          type="submit"
          color="primary"
          prepend-icon="tabler-device-floppy"
        >
          Guardar
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
<style scoped>
.vacante-lista {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>

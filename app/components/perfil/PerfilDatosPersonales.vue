<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'

export interface DatosPersonales {
  dpi: string
  primer_nombre: string
  segundo_nombre: string
  tercer_nombre: string
  primer_apellido: string
  segundo_apellido: string
  correo_contacto: string
  telefono_contacto: string
  fecha_nacimiento: string
  expectativa_salarial: number | string
}

const datos = defineModel<DatosPersonales>({ required: true })

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

const refFormDatos = ref<VForm>()
const guardandoDatos = ref(false)

const soloLetras = (v: string) => !v || /^[\p{L}][\p{L} .'-]*$/u.test(v) || 'Solo se permiten letras'
const telefonoValido = (v: string) => /^\d{8,11}$/.test(v ?? '') || 'Debe tener entre 8 y 11 dígitos'
const salarioValido = (v: string | number) => (v !== '' && Number(v) >= 0) || 'Ingresa un monto válido'

watch(() => datos.value.telefono_contacto, v => {
  const limpio = (v ?? '').replace(/\D/g, '').slice(0, 11)

  if (limpio !== v)
    datos.value.telefono_contacto = limpio
})

async function guardarDatos() {
  const { valid } = await refFormDatos.value!.validate()

  if (!valid || guardandoDatos.value)
    return

  guardandoDatos.value = true

  try {
    const { dpi: _dpi, ...cuerpo } = datos.value

    const respuesta = await peticion<{ message: string }>('/api/portal/perfil', {
      method: 'PUT',
      body: {
        ...cuerpo,
        segundo_nombre: cuerpo.segundo_nombre || null,
        tercer_nombre: cuerpo.tercer_nombre || null,
        segundo_apellido: cuerpo.segundo_apellido || null,
      },
    })

    showToastSuccess(respuesta.message)
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudieron guardar los datos'))
  }
  finally {
    guardandoDatos.value = false
  }
}
</script>

<template>
  <PerfilTarjeta>
    <h2 class="perfil-seccion">
      Datos personales
    </h2>

    <VForm
      ref="refFormDatos"
      :disabled="guardandoDatos"
      @submit.prevent="guardarDatos"
    >
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="datos.primer_nombre"
            :rules="[requiredValidator, soloLetras]"
            label="Primer nombre"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="datos.segundo_nombre"
            :rules="[soloLetras]"
            label="Segundo nombre (opcional)"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="datos.tercer_nombre"
            :rules="[soloLetras]"
            label="Tercer nombre (opcional)"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="datos.primer_apellido"
            :rules="[requiredValidator, soloLetras]"
            label="Primer apellido"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="datos.segundo_apellido"
            :rules="[soloLetras]"
            label="Segundo apellido (opcional)"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="datos.dpi"
            label="DPI"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="datos.fecha_nacimiento"
            :rules="[requiredValidator]"
            label="Fecha de nacimiento"
            type="date"
          />
        </VCol>
        <VCol
          cols="12"
          md="4"
        >
          <AppTextField
            v-model="datos.expectativa_salarial"
            :rules="[salarioValido]"
            label="Expectativa salarial (Q)"
            type="number"
            min="0"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="datos.correo_contacto"
            :rules="[requiredValidator, emailValidator]"
            label="Correo de contacto"
            type="email"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <AppTextField
            v-model="datos.telefono_contacto"
            :rules="[requiredValidator, telefonoValido]"
            label="Teléfono"
            inputmode="numeric"
            maxlength="11"
          />
        </VCol>
      </VRow>

      <VBtn
        type="submit"
        color="#123e66"
        class="mt-2"
        :loading="guardandoDatos"
        :disabled="guardandoDatos"
      >
        Guardar datos
      </VBtn>
    </VForm>
  </PerfilTarjeta>
</template>

<style scoped>
.perfil-seccion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.15rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.0625rem;
  font-weight: 700;
}

.perfil-seccion::before {
  content: '';
  display: inline-block;
  inline-size: 3.5px;
  block-size: 1.05rem;
  border-radius: 99px;
  background: var(--portal-verde);
}
</style>

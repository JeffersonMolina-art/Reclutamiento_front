<script setup lang="ts">
export interface DatosCandidato {
  primer_nombre: string
  segundo_nombre: string
  tercer_nombre: string
  primer_apellido: string
  segundo_apellido: string
  dpi: string
  email: string
  telefono: string
  fecha_nacimiento: string
  expectativa_salarial: number | string
}

const candidato = defineModel<DatosCandidato>({ required: true })

const fechaMaximaNacimiento = computed(() => {
  const fecha = new Date()

  fecha.setFullYear(fecha.getFullYear() - 18)

  return fecha.toLocaleDateString('en-CA')
})

const reglaNombre = (obligatorio: boolean) => (valor: string) => {
  const texto = (valor ?? '').trim()

  if (!texto)
    return obligatorio ? 'Este campo es obligatorio.' : true

  return /^[\p{L} .'-]{2,45}$/u.test(texto) || 'Usa de 2 a 45 letras, espacios, punto, apóstrofe o guion.'
}

const reglaDpi = (valor: string) =>
  /^\d{13}$/.test((valor ?? '').replace(/\s/g, '')) || 'El DPI debe tener exactamente 13 dígitos.'

const reglaCorreo = (valor: string) => {
  const texto = (valor ?? '').trim()

  return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto) && texto.length <= 100) || 'Ingresa un correo válido.'
}

const reglaTelefono = (valor: string) =>
  /^\+?\d{8,11}$/.test((valor ?? '').replace(/[\s-]/g, '')) || 'El teléfono debe tener de 8 a 11 dígitos.'

const reglaFechaNacimiento = (valor: string) => {
  if (!valor)
    return 'Este campo es obligatorio.'

  return valor <= fechaMaximaNacimiento.value || 'El candidato debe ser mayor de 18 años.'
}

const reglaSalario = (valor: number | string) =>
  (valor !== '' && valor !== null && Number(valor) > 0) || 'Ingresa un monto mayor a cero.'
</script>

<template>
  <VExpansionPanel
    value="datos"
    eager
  >
    <VExpansionPanelTitle>
      <VIcon
        icon="tabler-user"
        class="me-2"
      />
      Datos del candidato
    </VExpansionPanelTitle>
    <VExpansionPanelText>
      <VRow class="pt-2">
        <VCol
          cols="12"
          sm="4"
        >
          <AppTextField
            v-model="candidato.primer_nombre"
            label="Primer nombre"
            maxlength="45"
            :rules="[reglaNombre(true)]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="4"
        >
          <AppTextField
            v-model="candidato.segundo_nombre"
            label="Segundo nombre"
            maxlength="45"
            :rules="[reglaNombre(false)]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="4"
        >
          <AppTextField
            v-model="candidato.tercer_nombre"
            label="Tercer nombre"
            maxlength="45"
            :rules="[reglaNombre(false)]"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="candidato.primer_apellido"
            label="Primer apellido"
            maxlength="45"
            :rules="[reglaNombre(true)]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="candidato.segundo_apellido"
            label="Segundo apellido"
            maxlength="45"
            :rules="[reglaNombre(false)]"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="candidato.dpi"
            label="DPI"
            maxlength="17"
            :rules="[reglaDpi]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="candidato.fecha_nacimiento"
            label="Fecha de nacimiento"
            type="date"
            :max="fechaMaximaNacimiento"
            :rules="[reglaFechaNacimiento]"
          />
        </VCol>

        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="candidato.email"
            label="Correo electrónico"
            type="email"
            maxlength="100"
            :rules="[reglaCorreo]"
          />
        </VCol>
        <VCol
          cols="12"
          sm="6"
        >
          <AppTextField
            v-model="candidato.telefono"
            label="Teléfono"
            maxlength="14"
            :rules="[reglaTelefono]"
          />
        </VCol>

        <VCol cols="12">
          <AppTextField
            v-model="candidato.expectativa_salarial"
            label="Expectativa salarial (Q)"
            type="number"
            min="0"
            step="0.01"
            :rules="[reglaSalario]"
          />
        </VCol>
      </VRow>
    </VExpansionPanelText>
  </VExpansionPanel>
</template>

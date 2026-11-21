<template>
  <VContainer class="registro-contenedor py-10">
    <VBtn
      to="/reclutamiento"
      variant="text"
      prepend-icon="tabler-chevron-left"
      class="mb-5"
    >
      Volver al portal
    </VBtn>

    <VCard class="registro-card" variant="outlined">
      <header class="registro-cabecera">
        <p class="mb-2">Cooperativa Guayacán</p>
        <h1>Registro de candidatos</h1>
        <p class="mt-3 mb-0">
          Crea tu cuenta para postularte a nuestras vacantes y consultar
          el avance de tus postulaciones.
        </p>
      </header>

      <VCardText class="registro-cuerpo">
        <VForm ref="refForm" @submit.prevent="onSubmit">
          <section aria-labelledby="registro-datos">
            <h2 id="registro-datos" class="registro-seccion">
              Datos personales
            </h2>

            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.nombres"
                  :rules="[requiredValidator]"
                  label="Nombres"
                  autocomplete="given-name"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.apellidos"
                  :rules="[requiredValidator]"
                  label="Apellidos"
                  autocomplete="family-name"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.dpi"
                  :rules="[requiredValidator, dpiValido]"
                  label="DPI"
                  placeholder="13 dígitos"
                  inputmode="numeric"
                  maxlength="13"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.fecha_nacimiento"
                  :rules="[requiredValidator]"
                  label="Fecha de nacimiento"
                  type="date"
                  autocomplete="bday"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Correo electrónico"
                  type="email"
                  autocomplete="email"
                  placeholder="correo@ejemplo.com"
                />
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.telefono"
                  :rules="[requiredValidator]"
                  label="Teléfono"
                  type="tel"
                  autocomplete="tel"
                />
              </VCol>
            </VRow>
          </section>

          <VDivider class="my-6" />

          <section aria-labelledby="registro-acceso">
            <h2 id="registro-acceso" class="registro-seccion">
              Datos de acceso
            </h2>

            <VRow>
              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.password"
                  :rules="[requiredValidator, passwordValidator]"
                  label="Contraseña"
                  :type="verPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                >
                  <template #append-inner>
                    <VBtn
                      type="button"
                      variant="text"
                      size="small"
                      :icon="verPassword ? 'tabler-eye-off' : 'tabler-eye'"
                      :aria-label="verPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'"
                      @click="verPassword = !verPassword"
                    />
                  </template>
                </AppTextField>
              </VCol>

              <VCol cols="12" md="6">
                <AppTextField
                  v-model="data.password_confirmation"
                  :rules="[requiredValidator, coincidePassword]"
                  label="Confirmar contraseña"
                  :type="verPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                />
              </VCol>
            </VRow>
          </section>

          <VCheckbox
            v-model="data.acepta_terminos"
            :rules="[aceptaTerminos]"
            color="primary"
            class="mt-4"
            label="Acepto el tratamiento de mis datos personales para el proceso de reclutamiento"
          />

          <div class="registro-acciones">
            <VBtn
              type="submit"
              color="primary"
              size="large"
              :loading="cargando"
              :disabled="cargando"
            >
              Crear cuenta
            </VBtn>

            <NuxtLink to="/login" class="text-primary">
              Ya tengo cuenta
            </NuxtLink>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<style scoped>
.registro-contenedor {
  max-inline-size: 58rem;
}

.registro-card {
  overflow: hidden;
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 1.125rem;
}

.registro-cabecera {
  border-block-start: 4px solid #ffb300;
  padding: clamp(1.4rem, 4vw, 2.5rem);
  background: linear-gradient(125deg, #102e4d, #1f5680);
  color: white;
}

.registro-cabecera h1 {
  margin: 0;
  font-size: clamp(1.9rem, 5vw, 3rem);
  line-height: 1.1;
}

.registro-cabecera p {
  max-inline-size: 54ch;
  line-height: 1.55;
}

.registro-cuerpo {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.registro-seccion {
  margin-block: 0 1rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.registro-acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  margin-block-start: 1rem;
}

@media (max-width: 480px) {
  .registro-acciones {
    align-items: stretch;
    flex-direction: column;
  }

  .registro-acciones a {
    text-align: center;
  }
}
</style>

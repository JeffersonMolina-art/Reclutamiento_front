<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'
import type { CandidatoExternoInterface } from '@/types/reclutamiento'

definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

useSeoMeta({ title: 'Crear cuenta de candidato' })

const { registrarCandidato } = usePortalReclutamiento()
const { showToastSuccess, showToastError } = useToast()
const route = useRoute()

const refForm = ref<VForm>()
const cargando = ref(false)
const verPassword = ref(false)

const data = ref<CandidatoExternoInterface>({
  primer_nombre: '',
  segundo_nombre: '',
  tercer_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  dpi: '',
  email: '',
  telefono: '',
  fecha_nacimiento: null,
  password: '',
  password_confirmation: '',
  acepta_terminos: false,
})

function soloDigitos(event: Event) {
  const campo = event.target

  if (!(campo instanceof HTMLInputElement))
    return

  const limpio = campo.value.replace(/[^0-9]/g, '')

  if (campo.value !== limpio)
    campo.value = limpio
}

watch(() => data.value.dpi, valor => {
  const limpio = (valor ?? '').replace(/[^0-9]/g, '').slice(0, 13)

  if (limpio !== valor)
    data.value.dpi = limpio
})

watch(() => data.value.telefono, valor => {
  const limpio = (valor ?? '').replace(/[^0-9]/g, '').slice(0, 11)

  if (limpio !== valor)
    data.value.telefono = limpio
})

function fechaLocalISO(fecha: Date) {
  const anio = String(fecha.getFullYear()).padStart(4, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

const fechaActual = new Date()
const hoy = fechaLocalISO(fechaActual)
const fechaLimiteEdad = new Date(fechaActual)

fechaLimiteEdad.setFullYear(fechaLimiteEdad.getFullYear() - 18)

const limiteEdad = fechaLocalISO(fechaLimiteEdad)

const soloLetras = (valor: string) =>
  !valor || /^[\p{L}][\p{L} .'-]*$/u.test(valor) || 'Solo se permiten letras'

const dpiValido = (valor: string | null) =>
  /^[0-9]{13}$/.test(valor ?? '') || 'El DPI debe tener 13 dígitos'

const telefonoValido = (valor: string | null) =>
  /^[0-9]{8,11}$/.test(valor ?? '') || 'El teléfono debe tener entre 8 y 11 dígitos'

function fechaNoFutura(valor: string | null) {
  if (!valor)
    return true

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor))
    return 'Ingresa una fecha de nacimiento válida'

  const fecha = new Date(`${valor}T12:00:00`)

  if (Number.isNaN(fecha.getTime()) || fechaLocalISO(fecha) !== valor)
    return 'Ingresa una fecha de nacimiento válida'

  return valor <= hoy || 'La fecha de nacimiento no puede ser futura'
}

const mayorDeEdad = (valor: string | null) =>
  !valor || valor <= limiteEdad || 'Debes tener al menos 18 años'

const passwordSegura = (valor: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(valor ?? '')
  || 'Mínimo 8 caracteres, con mayúscula, minúscula y número'

const coincidePassword = (valor: string) =>
  valor === data.value.password || 'Las contraseñas no coinciden'

const aceptaTerminos = (valor: boolean) => valor || 'Debes aceptar los términos'

async function onSubmit() {
  if (!refForm.value || cargando.value)
    return

  cargando.value = true

  try {
    const { valid } = await refForm.value.validate()

    if (!valid)
      return

    const respuesta = await registrarCandidato(data.value)

    showToastSuccess(respuesta.message ?? 'Registro exitoso.')

    const vacante = route.query.vacante

    await navigateTo({
      path: '/login',
      query: vacante ? { vacante: String(vacante) } : {},
    })
  }
  catch (error: any) {
    const errores = error.response?.data?.errors
    const primerError = errores
      ? (Object.values(errores)[0] as string[] | undefined)?.[0]
      : undefined

    showToastError(
      primerError
      ?? error.response?.data?.message
      ?? 'No se pudo completar el registro',
    )
  }
  finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="registro-pagina">
    <VContainer class="registro-contenedor">
      <VBtn
        to="/reclutamiento"
        variant="text"
        prepend-icon="tabler-arrow-left"
        class="registro-volver"
      >
        Volver al portal
      </VBtn>

      <VCard class="registro-card" elevation="0" :loading="cargando">
        <VOverlay
          :model-value="cargando"
          contained
          persistent
          scrim="#ffffff"
          class="align-center justify-center"
        >
          <div class="registro-espera">
            <VProgressCircular indeterminate size="48" color="#123e66" />
            <span>Creando tu cuenta, por favor espera...</span>
          </div>
        </VOverlay>
        <header class="registro-cabecera">
          <span class="registro-etiqueta">Cooperativa Guayacán</span>
          <h1>Registro de candidatos</h1>
          <p>
            Crea tu cuenta para postularte a nuestras vacantes y consultar
            el avance de tus postulaciones.
          </p>
        </header>

        <VCardText class="registro-cuerpo">
          <VForm
            ref="refForm"
            :disabled="cargando"
            :aria-busy="cargando"
            @submit.prevent="onSubmit"
          >
            <section aria-labelledby="registro-nombres">
              <h2 id="registro-nombres" class="registro-seccion">
                Nombres y apellidos
              </h2>

              <VRow>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="data.primer_nombre"
                    :rules="[requiredValidator, soloLetras]"
                    label="Primer nombre"
                    placeholder="Primer nombre"
                    autocomplete="given-name"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="data.segundo_nombre"
                    :rules="[soloLetras]"
                    label="Segundo nombre (opcional)"
                    placeholder="Segundo nombre"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="data.tercer_nombre"
                    :rules="[soloLetras]"
                    label="Tercer nombre (opcional)"
                    placeholder="Tercer nombre"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="data.primer_apellido"
                    :rules="[requiredValidator, soloLetras]"
                    label="Primer apellido"
                    placeholder="Primer apellido"
                    autocomplete="family-name"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="data.segundo_apellido"
                    :rules="[soloLetras]"
                    label="Segundo apellido (opcional)"
                    placeholder="Segundo apellido"
                  />
                </VCol>
              </VRow>
            </section>

            <VDivider class="registro-divisor" />

            <section aria-labelledby="registro-identificacion">
              <h2 id="registro-identificacion" class="registro-seccion">
                Identificación
              </h2>

              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="data.dpi"
                    :rules="[requiredValidator, dpiValido]"
                    label="DPI"
                    placeholder="13 dígitos sin espacios"
                    type="text"
                    inputmode="numeric"
                    maxlength="13"
                    @input.capture="soloDigitos"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="data.fecha_nacimiento"
                    :rules="[requiredValidator, fechaNoFutura, mayorDeEdad]"
                    :max="hoy"
                    label="Fecha de nacimiento"
                    type="date"
                    autocomplete="bday"
                  />
                </VCol>
              </VRow>
            </section>

            <VDivider class="registro-divisor" />

            <section aria-labelledby="registro-contacto">
              <h2 id="registro-contacto" class="registro-seccion">
                Datos de contacto
              </h2>

              <VRow>
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
                    :rules="[requiredValidator, telefonoValido]"
                    label="Teléfono"
                    type="tel"
                    inputmode="numeric"
                    maxlength="11"
                    placeholder="Ej. 55123456"
                    autocomplete="tel"
                    @input.capture="soloDigitos"
                  />
                </VCol>
              </VRow>
            </section>

            <VDivider class="registro-divisor" />

            <section aria-labelledby="registro-acceso">
              <h2 id="registro-acceso" class="registro-seccion">
                Datos de acceso
              </h2>

              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="data.password"
                    :rules="[requiredValidator, passwordSegura]"
                    label="Contraseña"
                    placeholder="Mínimo 8 caracteres"
                    :type="verPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                  >
                    <template #append-inner>
                      <VBtn
                        type="button"
                        variant="text"
                        size="small"
                        density="comfortable"
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
                    placeholder="Repite tu contraseña"
                    :type="verPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                  />
                </VCol>
              </VRow>
            </section>

            <div class="registro-terminos">
              <VCheckbox
                v-model="data.acepta_terminos"
                :rules="[aceptaTerminos]"
                color="#123e66"
                density="comfortable"
                label="Acepto el tratamiento de mis datos personales para el proceso de reclutamiento"
              />
            </div>

            <div class="registro-acciones">
              <VBtn
                type="submit"
                color="#123e66"
                size="large"
                class="registro-btn-submit"
                :loading="cargando"
                :disabled="cargando"
              >
                Crear cuenta
              </VBtn>

              <p class="registro-login-texto">
                ¿Ya tienes una cuenta?
                <NuxtLink
                  :to="{ path: '/login', query: route.query.vacante ? { vacante: String(route.query.vacante) } : {} }"
                  class="registro-login-enlace"
                >
                  Inicia sesión
                </NuxtLink>
              </p>
            </div>
          </VForm>
        </VCardText>
      </VCard>
    </VContainer>
  </div>
</template>

<style scoped>
.registro-pagina {
  --portal-azul: #123e66;
  --portal-azul-oscuro: #0d2e4d;
  --portal-verde: #80b94e;
  --portal-borde: rgba(18, 62, 102, 0.12);

  min-block-size: 80vh;
  padding-block: 2rem 4rem;
  background: #f5f7fa;
}

.registro-contenedor {
  max-inline-size: 54rem;
}

.registro-volver {
  margin-block-end: 1.25rem;
  color: var(--portal-azul) !important;
  font-weight: 600;
  padding-inline: 0.5rem;
}

.registro-card {
  overflow: hidden;
  border: 1px solid var(--portal-borde);
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 8px 28px -6px rgba(13, 46, 77, 0.08);
}

.registro-espera {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #123e66;
  font-weight: 600;
}

.registro-cabecera {
  padding: clamp(1.75rem, 4vw, 2.5rem);
  border-block-end: 3px solid var(--portal-verde);
  background: linear-gradient(135deg, var(--portal-azul-oscuro), var(--portal-azul));
  color: #ffffff;
}

.registro-etiqueta {
  display: inline-block;
  margin-block-end: 0.65rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(128, 185, 78, 0.18);
  color: #a9e374;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.registro-cabecera h1 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(1.65rem, 3.5vw, 2.25rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.registro-cabecera p {
  max-inline-size: 52ch;
  margin: 0.65rem 0 0;
  color: #dbe7f3;
  font-size: 0.975rem;
  line-height: 1.55;
}

.registro-cuerpo {
  padding: clamp(1.5rem, 4vw, 2.5rem);
}

.registro-seccion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-block: 0 1.25rem;
  color: var(--portal-azul);
  font-size: 1.0625rem;
  font-weight: 700;
}

.registro-seccion::before {
  content: '';
  display: inline-block;
  inline-size: 3.5px;
  block-size: 1.05rem;
  border-radius: 99px;
  background: var(--portal-verde);
}

.registro-divisor {
  margin-block: 1.75rem;
  opacity: 0.65;
}

.registro-terminos {
  margin-block-start: 1.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--portal-borde);
  border-radius: 0.75rem;
  background: #f8fafc;
}

.registro-acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-block-start: 1.75rem;
  padding-block-start: 1.5rem;
  border-block-start: 1px solid var(--portal-borde);
}

.registro-btn-submit {
  color: #ffffff !important;
  font-weight: 600;
  padding-inline: 2rem;
  border-radius: 0.65rem;
}

.registro-login-texto {
  margin: 0;
  color: #526375;
  font-size: 0.9375rem;
}

.registro-login-enlace {
  color: var(--portal-azul);
  font-weight: 700;
  text-decoration: none;
  margin-inline-start: 0.25rem;
}

.registro-login-enlace:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

@media (max-width: 540px) {
  .registro-acciones {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>

<script setup lang="ts">
import type { VForm } from 'vuetify/components/VForm'

definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

useSeoMeta({ title: 'Ingresar al portal de candidatos' })

const { login, estaAutenticado } = useCandidatoSesion()
const route = useRoute()

const refForm = ref<VForm>()
const cargando = ref(false)
const verPassword = ref(false)
const mensajeError = ref('')

const form = ref({ email: '', password: '' })

const destino = computed(() => {
  const vacante = route.query.vacante

  return vacante
    ? { path: '/reclutamiento/vacantes', query: { vacante: String(vacante) } }
    : { path: '/reclutamiento/vacantes' }
})

const registroLink = computed(() => ({
  path: '/reclutamiento/registro',
  query: route.query.vacante ? { vacante: String(route.query.vacante) } : {},
}))

watch(form, () => {
  mensajeError.value = ''
}, { deep: true })

onMounted(() => {
  if (estaAutenticado.value)
    navigateTo(destino.value)
})

const onSubmit = async () => {
  const { valid } = await refForm.value!.validate()

  if (!valid || cargando.value)
    return

  cargando.value = true

  try {
    await login(form.value.email.trim().toLowerCase(), form.value.password)
    await navigateTo(destino.value)
  }
  catch (error: any) {
    const estado = error?.response?.status ?? error?.statusCode

    mensajeError.value = estado === 429
      ? 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
      : error?.data?.message ?? 'No se pudo iniciar sesión'
  }
  finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-pagina">
    <VContainer class="login-contenedor">
      <VCard class="login-card" elevation="0" :loading="cargando">
        <header class="login-cabecera">
          <span class="login-etiqueta">Portal de candidatos</span>
          <h1>Iniciar sesión</h1>
          <p>Ingresa para postularte a las vacantes y dar seguimiento a tu proceso.</p>
        </header>

        <VCardText class="login-cuerpo">
          <VAlert
            v-if="mensajeError"
            type="error"
            variant="tonal"
            class="mb-5"
            role="alert"
          >
            {{ mensajeError }}
          </VAlert>

          <VForm ref="refForm" :disabled="cargando" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.email"
                  :rules="[requiredValidator, emailValidator]"
                  label="Correo electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email"
                />
              </VCol>

              <VCol cols="12">
                <AppTextField
                  v-model="form.password"
                  :rules="[requiredValidator]"
                  label="Contraseña"
                  placeholder="Tu contraseña"
                  :type="verPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                >
                  <template #append-inner>
                    <VBtn
                      type="button"
                      variant="text"
                      size="small"
                      density="comfortable"
                      :icon="verPassword ? 'tabler-eye-off' : 'tabler-eye'"
                      :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      @click="verPassword = !verPassword"
                    />
                  </template>
                </AppTextField>
              </VCol>

              <VCol cols="12">
                <VBtn
                  type="submit"
                  color="#123e66"
                  size="large"
                  block
                  class="login-btn"
                  :loading="cargando"
                  :disabled="cargando"
                >
                  Ingresar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>

          <p class="login-registro">
            ¿Aún no tienes cuenta?
            <NuxtLink :to="registroLink" class="login-enlace">
              Crear cuenta
            </NuxtLink>
          </p>
        </VCardText>
      </VCard>
    </VContainer>
  </div>
</template>

<style scoped>
.login-pagina {
  --portal-azul: #123e66;
  --portal-azul-oscuro: #0d2e4d;
  --portal-verde: #80b94e;
  --portal-borde: rgba(var(--v-border-color), var(--v-border-opacity));

  min-block-size: 80vh;
  padding-block: clamp(5rem, 7vw, 6.25rem) 4rem;
  background: rgb(var(--v-theme-background));
}

.login-contenedor {
  max-inline-size: 30rem;
}

.login-card {
  overflow: hidden;
  border: 1px solid var(--portal-borde);
  border-radius: 1rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 8px 28px -6px rgba(0, 0, 0, 0.12);
}

.login-cabecera {
  padding: 1.75rem 2rem;
  border-block-end: 3px solid var(--portal-verde);
  background: linear-gradient(135deg, var(--portal-azul-oscuro), var(--portal-azul));
  color: #ffffff;
}

.login-etiqueta {
  display: inline-block;
  margin-block-end: 0.6rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(128, 185, 78, 0.18);
  color: #a9e374;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.login-cabecera h1 {
  margin: 0;
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.login-cabecera p {
  margin: 0.5rem 0 0;
  color: #dbe7f3;
  font-size: 0.95rem;
  line-height: 1.5;
}

.login-cuerpo {
  padding: 2rem;
}

.login-btn {
  font-weight: 600;
  border-radius: 0.65rem;
}

.login-registro {
  margin: 1.5rem 0 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  text-align: center;
  font-size: 0.9375rem;
}

.login-enlace {
  margin-inline-start: 0.25rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
  text-decoration: none;
}

.login-enlace:hover {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
</style>

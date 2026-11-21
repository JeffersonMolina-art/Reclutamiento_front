<script lang="ts" setup>
import { useTheme } from 'vuetify'
import { useConfigStore } from '@core/stores/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils'
import type { preferenciasUsuario } from '@core/types'
import PaginaCargando from '@/components/layout/PaginaCargando.vue'
import { cookieRef, useLayoutConfigStore } from '@/@layouts/stores/config'
import { useIsMobile } from '@/composables/useIsMobile'
import {onMounted} from "vue";

const { layoutAttrs, injectSkinClasses } = useSkins()
const { get } = useClienteRequest()
const { showToastError } = useToast()
const { cargandoPagina, paginaEspera } = useCargandoPagina()
const { isMobile } = useIsMobile()

const DefaultLayoutWithHorizontalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithHorizontalNav.vue'))
const DefaultLayoutWithVerticalNav = defineAsyncComponent(() => import('./components/DefaultLayoutWithVerticalNav.vue'))
const MobileLayoutWithBottomNav = defineAsyncComponent(() => import('./components/MobileLayoutWithBottomNav.vue'))

const configStore = useConfigStore()
const vuetifyTheme = useTheme()

switchToVerticalNavOnLtOverlayNavBreakpoint()
injectSkinClasses()

const menu = useState('menu', () => [])

const currentLayout = computed(() => {
  if (isMobile.value)
    return MobileLayoutWithBottomNav

  return configStore.appContentLayoutNav === AppContentLayoutNav.Vertical
    ? DefaultLayoutWithVerticalNav
    : DefaultLayoutWithHorizontalNav
})

const getOpcionesMenu = async (): Promise<void> => {
  try {
    const res = await get('api/menu_opciones', {
      per_page: -1,
    })

    menu.value = res.data.data

    return res
  }
  catch (error) {
    throw error
  }
}

const getConfiguraciones = async (): Promise<void> => {
  cargandoPagina.value = true
  try {
    await getOpcionesMenu()
    await getPreferencias()
  }
  catch (error) {
    manejaError(error)
  }
  finally {
    cargandoPagina.value = false
  }
}

getConfiguraciones()

const getPreferencias = async (): Promise<void> => {
  if (tienePreferencias.value) {
    return useLayoutConfigStore().assignValuesToCookies()
    asignarValorDesdeCookies()
  }

  try {
    const res = await get<{ data: preferenciasUsuario }>('api/user_preferencias')
    if (!res.data) {
      asigarValorDefectoCookies()

      return
    }
    await asignarDataACookies(res.data)
    configStore.asignarDataACookiesDefault()
  }
  catch (error: { message: string }) {
    showToastError(error.message)
  }
}

const asignarDataACookies = (data: preferenciasUsuario): void => {
  cookieRef('color_primario_tema_light', '#32A343').value = data.color_primario_tema_light
  cookieRef('color_oscurecimiento_primario_tema_light', '#32A343').value = data.color_oscurecimiento_primario_tema_light

  vuetifyTheme.themes.value.light.colors.primary = data.color_primario_tema_light
  vuetifyTheme.themes.value.light.colors['primary-darken-1'] = data.color_oscurecimiento_primario_tema_light

  cookieRef('color_primario_tema_dark', '#32A343').value = data.color_primario_tema_dark
  cookieRef('color_oscurecimiento_primario_tema_dark', '#32A343').value = data.color_oscurecimiento_primario_tema_dark

  vuetifyTheme.themes.value.dark.colors.primary = data.color_primario_tema_dark
  vuetifyTheme.themes.value.dark.colors['primary-darken-1'] = data.color_oscurecimiento_primario_tema_dark

  cookieRef('tema', 'light').value = data.tema
  configStore.theme = data.tema

  cookieRef('tema_color', 'light').value = data.tema_color
  cookieRef('aspecto', 'default').value = data.aspecto
  configStore.skin = data.aspecto

  cookieRef('esta_navBar_vertical_colapsada', false).value = data.esta_navBar_vertical_colapsada
  configStore.isVerticalNavCollapsed = data.esta_navBar_vertical_colapsada === true

  cookieRef('es_navBar_vertical_semioscura', false).value = data.es_navBar_vertical_semioscura
  configStore.isVerticalNavSemiDark = data.es_navBar_vertical_semioscura === true

  const navBarLayoutCookie = cookieRef('navBar_loyout', '')

  navBarLayoutCookie.value = data.navBar_loyout ?? 'vertical'
  configStore.appContentLayoutNav = navBarLayoutCookie.value

  cookieRef('ancho_contenido_aplicacion', 'boxed').value = data.ancho_contenido_aplicacion
  configStore.appContentWidth = data.ancho_contenido_aplicacion

  cookieRef('orientacion', 'ltr').value = data.direccion
  configStore.isAppRTL = data.direccion === 'rtl'

  cookieRef('navBar_vertical_tipo', 'sticky').value = data.navBar_vertical_tipo
  configStore.navbarType = data.navBar_vertical_tipo

  cookieRef('navBar_horizontal_tipo', 'sticky').value = data.navBar_horizontal_tipo
  configStore.horizontalNavType = data.navBar_horizontal_tipo

  cookieRef('tiene_preferencias', false).value = true
}

const asigarValorDefectoCookies = (): void => {
  cookieRef('color_primario_tema_light', '#32A343').value = '#32A343'
  cookieRef('color_oscurecimiento_primario_tema_light', '#32A343').value = '#32A343'

  vuetifyTheme.themes.value.light.colors.primary = '#32A343'
  vuetifyTheme.themes.value.light.colors['primary-darken-1'] = '#32A343'

  cookieRef('color_primario_tema_dark', '#32A343').value = '#32A343'
  cookieRef('color_oscurecimiento_primario_tema_dark', '#32A343').value = '#32A343'

  vuetifyTheme.themes.value.dark.colors.primary = '#32A343'
  vuetifyTheme.themes.value.dark.colors['primary-darken-1'] = '#32A343'

  cookieRef('tema', 'light').value = 'light'
  configStore.theme = 'light'

  cookieRef('tema_color', 'light').value = 'light'

  cookieRef('aspecto', 'default').value = 'default'
  configStore.skin = 'default'

  cookieRef('esta_navBar_vertical_colapsada', false).value = false
  configStore.isVerticalNavCollapsed = false

  cookieRef('navBar_loyout', 'vertical').value = 'vertical'
  configStore.appContentLayoutNav = 'vertical'

  cookieRef('ancho_contenido_aplicacion', 'fluid').value = 'fluid'
  configStore.appContentWidth = 'fluid'

  cookieRef('orientacion', 'ltr').value = 'ltr'
  configStore.isAppRTL = false

  cookieRef('tiene_preferencias', false).value = false
}

const asignarValorDesdeCookies = (): void => {
  vuetifyTheme.themes.value.light.colors.primary = cookieRef('color_primario_tema_light', '#32A343').value
  vuetifyTheme.themes.value.light.colors['primary-darken-1'] = cookieRef('color_oscurecimiento_primario_tema_light', '#32A343').value
  vuetifyTheme.themes.value.dark.colors.primary = cookieRef('color_primario_tema_dark', '#32A343').value
  vuetifyTheme.themes.value.dark.colors['primary-darken-1'] = cookieRef('color_oscurecimiento_primario_tema_dark', '#32A343').value
  configStore.isAppRTL = cookieRef('orientacion', 'ltr').value === 'rtl'
}

const tienePreferencias = cookieRef<boolean>('tiene_preferencias', false)

const nuxtApp = useNuxtApp()

// Conserva el aviso aunque se vuelva a montar el layout.
const nuevaVersionDisponible = useState<boolean>(
  'nueva-version-disponible',
  () => false,
)

const hayInternet = ref(true)

const mostrarActualizacion = computed(() => {
  return nuevaVersionDisponible.value && hayInternet.value
})

const actualizarConexion = () => {
  hayInternet.value = navigator.onLine
}

let quitarListenerActualizacion: (() => void) | undefined

onMounted(() => {
  actualizarConexion()

  quitarListenerActualizacion = nuxtApp.hook(
    'app:manifest:update',
    () => {
      nuevaVersionDisponible.value = true
    },
  )

  window.addEventListener('online', actualizarConexion)
  window.addEventListener('offline', actualizarConexion)
})

onBeforeUnmount(() => {
  quitarListenerActualizacion?.()

  window.removeEventListener('online', actualizarConexion)
  window.removeEventListener('offline', actualizarConexion)
})

const recargarPagina = () => {
  if (navigator.onLine)
    window.location.reload()
}
</script>

<template>
  <Component
    :is="currentLayout"
    v-if="!cargandoPagina"
    v-bind="layoutAttrs"
  >
    <slot />
  </Component>

  <PaginaCargando v-if="cargandoPagina" />

  <VSnackbar
    :model-value="mostrarActualizacion"
    :timeout="-1"
    color="primary"
    location="bottom right"
    class="update-snackbar"
    elevation="10"
    transition="slide-y-reverse-transition"
  >
    <div class="d-flex align-center gap-3">
      <VIcon
        icon="tabler-refresh"
        size="26"
        class="spin-icon flex-shrink-0"
      />
      <div class="d-flex flex-column">
        <span class="text-subtitle-2 font-weight-bold text-white lh-1">
          ¡Nueva versión disponible!
        </span>
        <span
          class="text-caption text-white opacity-90 mt-1"
          style="line-height: 1.2;"
        >
          Hemos actualizado el sistema. Recarga para aplicar los cambios.
        </span>
      </div>
    </div>

    <template #actions>
      <VBtn
        color="white"
        variant="elevated"
        size="small"
        class="update-btn font-weight-bold ms-2 text-primary"
        @click="recargarPagina"
      >
        Recargar
      </VBtn>
    </template>
  </VSnackbar>

  <VOverlay
    v-model="paginaEspera"
    class="align-center justify-center"
    persistent
    scroll-strategy="none"
  >
    <div class="overlay-content text-center">
      <img
        alt="Logo"
        src="/guayacan_logo.svg"
        style="width: 250px"
      >
      <h3
        class="loading-text"
        style="margin-left: 17px"
      >
        Por favor, espera...
      </h3>
    </div>
  </VOverlay>
</template>

<style lang="scss">
@use "@layouts/styles/default-layout";

.update-snackbar {
  .v-snackbar__wrapper {
    min-width: auto !important; /* Elimina el ancho gigante de Windows */
    max-width: 420px; /* Límite saludable para pantallas grandes */
    border-radius: 8px; /* Bordes menos exagerados */
    padding: 6px 12px; /* Padding reducido para hacerlo más bajo */
  }

  .spin-icon {
    animation: spin 4s linear infinite;
  }

  .update-btn {
    border-radius: 6px;
    letter-spacing: 0.3px;
    text-transform: none;
    color: var(--v-theme-primary);
  }
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Ajustes específicos para pantallas pequeñas (Móviles) */
@media (max-width: 600px) {
  .update-snackbar {
    .v-snackbar__wrapper {
      max-width: 95vw !important; /* Aprovecha el ancho del celular */
      margin: 0 auto; /* Centra el componente */
    }

    /* El botón se hace un poco más compacto en móvil para no robar espacio */
    .update-btn {
      padding: 0 10px;
      font-size: 0.75rem;
    }
  }
}
</style>

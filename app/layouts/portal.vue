<script lang="ts" setup>

const menu = [
  { titulo: 'Inicio', to: '/reclutamiento', icono: 'tabler-home' },
  { titulo: 'Vacantes', to: '/reclutamiento/vacantes', icono: 'tabler-briefcase' },
]

const drawer = ref(false)

const { perfil, estaAutenticado, cargarPerfil, logout } = useCandidatoSesion()

onMounted(() => {
  if (estaAutenticado.value && !perfil.value)
    cargarPerfil()
})

const cerrarSesion = async () => {
  drawer.value = false
  await logout()
  await navigateTo('/reclutamiento')
}
</script>

<template>
  <div class="layout-wrapper layout-blank portal-layout">
    <VAppBar flat color="surface" class="portal-barra" :height="76">
      <VContainer class="portal-contenedor d-flex align-center">
        <VAppBarNavIcon
          class="d-md-none me-2"
          aria-label="Abrir menú del portal"
          :aria-expanded="drawer"
          @click="drawer = !drawer"
        />

        <NuxtLink to="/reclutamiento" class="portal-marca">
          <img
            src="/guayacan_logo.svg"
            alt="Logo de Cooperativa Guayacán"
            class="portal-marca-logo"
          >
          <span class="portal-marca-texto">
            <strong>Cooperativa Guayacán</strong>
            <small>Portal de empleo</small>
          </span>
        </NuxtLink>

        <VSpacer />

        <nav class="d-none d-md-flex align-center ga-1" aria-label="Navegación principal">
          <VBtn
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            variant="text"
            class="portal-nav-btn"
            exact
          >
            {{ item.titulo }}
          </VBtn>

          <template v-if="estaAutenticado">
            <VBtn
              to="/reclutamiento/perfil"
              variant="text"
              prepend-icon="tabler-user-circle"
              class="portal-nav-btn"
            >
              Mi perfil
            </VBtn>
            <VBtn
              to="/reclutamiento/mis-postulaciones"
              variant="text"
              prepend-icon="tabler-list-check"
              class="portal-nav-btn"
            >
              Mis postulaciones
            </VBtn>

            <VDivider vertical inset class="mx-2" />

            <span class="portal-saludo">
              <VIcon icon="tabler-user" size="16" aria-hidden="true" />
              <span>{{ perfil?.nombres ?? perfil?.email }}</span>
            </span>

            <VBtn
              variant="outlined"
              size="small"
              prepend-icon="tabler-logout"
              class="portal-btn-salir ms-2"
              @click="cerrarSesion"
            >
              Salir
            </VBtn>
          </template>

          <template v-else>
            <VDivider vertical inset class="mx-2" />

            <VBtn
              to="/reclutamiento/login"
              variant="text"
              prepend-icon="tabler-login"
              class="portal-nav-btn"
            >
              Ingresar
            </VBtn>

            <VBtn
              color="primary"
              variant="flat"
              to="/reclutamiento/registro"
              class="portal-btn-registro ms-1"
            >
              Crear cuenta
            </VBtn>
          </template>
        </nav>
      </VContainer>
    </VAppBar>

    <VNavigationDrawer v-model="drawer" temporary class="d-md-none portal-drawer">
      <div class="portal-drawer-cabecera">
        <img
          src="/guayacan_logo.svg"
          alt="Logo de Cooperativa Guayacán"
          class="portal-drawer-logo"
        >
        <div>
          <strong>Cooperativa Guayacán</strong>
          <small>Portal de empleo</small>
        </div>
      </div>

      <VDivider />

      <div v-if="estaAutenticado" class="portal-drawer-usuario">
        <VIcon icon="tabler-user-circle" size="20" color="primary" />
        <span>{{ perfil?.nombres ?? perfil?.email }}</span>
      </div>

      <VList nav density="comfortable" aria-label="Menú del portal">
        <VListItem
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icono"
          :title="item.titulo"
          exact
          @click="drawer = false"
        />
        <template v-if="estaAutenticado">
          <VListItem
            to="/reclutamiento/perfil"
            prepend-icon="tabler-user-circle"
            title="Mi perfil"
            @click="drawer = false"
          />
          <VListItem
            to="/reclutamiento/mis-postulaciones"
            prepend-icon="tabler-list-check"
            title="Mis postulaciones"
            @click="drawer = false"
          />
          <VDivider class="my-2" />
          <VListItem
            prepend-icon="tabler-logout"
            title="Salir"
            base-color="error"
            @click="cerrarSesion"
          />
        </template>
        <template v-else>
          <VDivider class="my-2" />
          <VListItem
            to="/reclutamiento/login"
            prepend-icon="tabler-login"
            title="Ingresar"
            @click="drawer = false"
          />
          <VListItem
            to="/reclutamiento/registro"
            prepend-icon="tabler-user-plus"
            title="Crear cuenta"
            color="primary"
            @click="drawer = false"
          />
        </template>
      </VList>
    </VNavigationDrawer>

    <VMain class="portal-main">
      <slot />
    </VMain>

    <VFooter class="portal-pie">
      <VContainer class="portal-contenedor d-flex flex-wrap justify-space-between align-center ga-4 py-5">
        <div class="portal-pie-info">
          <strong>Cooperativa Guayacán</strong>
          <span>© {{ new Date().getFullYear() }} · Portal de empleo y talento humano</span>
        </div>

        <nav class="portal-pie-enlaces" aria-label="Enlaces del pie de página">
          <NuxtLink to="/reclutamiento">Inicio</NuxtLink>
          <NuxtLink to="/reclutamiento/vacantes">Vacantes disponibles</NuxtLink>
          <NuxtLink v-if="!estaAutenticado" to="/reclutamiento/registro">Crear cuenta</NuxtLink>
          <NuxtLink v-else to="/reclutamiento/mis-postulaciones">Mis postulaciones</NuxtLink>
        </nav>
      </VContainer>
    </VFooter>
  </div>
</template>

<style scoped>
.layout-wrapper.portal-layout {
  --portal-azul: #123e66;
  --portal-azul-oscuro: #0c2944;
  --portal-verde: #80b94e;
  --portal-borde: rgba(var(--v-border-color), var(--v-border-opacity));

  display: flex;
  flex-direction: column;
  min-block-size: 100dvh;
}

.portal-contenedor {
  max-inline-size: 76rem;
}

.portal-layout > .v-main {
  flex: 1 0 auto;
}

.portal-layout > .v-footer {
  flex: 0 0 auto;
}

.portal-barra {
  border-block-start: 4px solid var(--portal-verde);
  border-block-end: 1px solid var(--portal-borde);
  box-shadow: 0 2px 14px -4px rgba(0, 0, 0, 0.08) !important;
}

.portal-marca {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
  transition: opacity 0.18s ease;
}

.portal-marca:hover {
  opacity: 0.88;
}

.portal-marca-logo {
  block-size: 2.9rem;
  inline-size: auto;
}

.portal-marca-texto {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.portal-marca-texto strong {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.015em;
}

.portal-marca-texto small {
  margin-block-start: 0.15rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.8125rem;
  font-weight: 500;
}

.portal-nav-btn {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.portal-saludo {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-inline-size: 13rem;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--portal-borde);
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.85rem;
  font-weight: 600;
}

.portal-saludo span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portal-btn-salir,
.portal-btn-registro {
  font-weight: 600;
  border-radius: 0.55rem;
}

.portal-drawer-cabecera {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  border-block-start: 4px solid var(--portal-verde);
}

.portal-drawer-logo {
  block-size: 2.5rem;
  inline-size: auto;
}

.portal-drawer-cabecera strong,
.portal-drawer-cabecera small {
  display: block;
  line-height: 1.2;
}

.portal-drawer-cabecera small {
  margin-block-start: 0.15rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.portal-drawer-usuario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0.75rem 0.25rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.6rem;
  background: rgba(var(--v-theme-on-surface), 0.04);
  font-size: 0.875rem;
  font-weight: 600;
}

.portal-drawer-usuario span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portal-pie {
  border-block-start: 3px solid var(--portal-verde);
  background: linear-gradient(135deg, var(--portal-azul-oscuro), var(--portal-azul)) !important;
  color: #ffffff;
}

.portal-pie-info strong {
  display: block;
  font-size: 0.975rem;
  font-weight: 750;
}

.portal-pie-info span {
  display: block;
  margin-block-start: 0.2rem;
  color: #cbd9e6;
  font-size: 0.85rem;
}

.portal-pie-enlaces {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
}

.portal-pie-enlaces a {
  color: #e2ecf5;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.18s ease;
}

.portal-pie-enlaces a:hover {
  color: #a3df6f;
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
</style>

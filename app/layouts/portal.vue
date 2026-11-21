<script lang="ts" setup>
const { injectSkinClasses } = useSkins()

injectSkinClasses()

const menu = [
  { titulo: 'Inicio', to: '/reclutamiento', icono: 'tabler-home' },
  { titulo: 'Vacantes', to: '/reclutamiento/vacantes', icono: 'tabler-briefcase' },
]

const drawer = ref(false)
</script>

<template>
  <div class="layout-wrapper layout-blank portal-layout">
    <VAppBar flat color="surface" class="portal-barra" :height="76">
      <VContainer class="d-flex align-center">
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
          <span>
            Cooperativa Guayacán
            <small>Portal de empleo</small>
          </span>
        </NuxtLink>

        <VSpacer />

        <nav class="d-none d-md-flex align-center ga-2" aria-label="Navegación principal">
          <VBtn
            v-for="item in menu"
            :key="item.to"
            :to="item.to"
            variant="text"
            exact
          >
            {{ item.titulo }}
          </VBtn>

          <VBtn to="/login" variant="text" prepend-icon="tabler-user">
            Ingresar
          </VBtn>

          <VBtn color="primary" to="/reclutamiento/registro">
            Crear cuenta
          </VBtn>
        </nav>
      </VContainer>
    </VAppBar>

    <VNavigationDrawer v-model="drawer" temporary class="d-md-none">
      <VList nav aria-label="Menú del portal">
        <VListItem
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icono"
          :title="item.titulo"
          exact
          @click="drawer = false"
        />
        <VListItem
          to="/login"
          prepend-icon="tabler-user"
          title="Ingresar"
          @click="drawer = false"
        />
        <VListItem
          to="/reclutamiento/registro"
          prepend-icon="tabler-user-plus"
          title="Crear cuenta"
          @click="drawer = false"
        />
      </VList>
    </VNavigationDrawer>

    <VMain>
      <slot />
    </VMain>

    <VFooter color="#102e4d" class="portal-pie">
      <VContainer class="d-flex flex-wrap justify-space-between align-center ga-4 py-4">
        <div>
          <strong>Cooperativa Guayacán</strong>
          <div>© {{ new Date().getFullYear() }} · Portal de empleo</div>
        </div>

        <nav class="d-flex flex-wrap ga-4" aria-label="Enlaces del pie de página">
          <NuxtLink to="/reclutamiento/vacantes">Ver vacantes</NuxtLink>
          <NuxtLink to="/reclutamiento/registro">Crear cuenta</NuxtLink>
        </nav>
      </VContainer>
    </VFooter>
  </div>
</template>

<style scoped>
.layout-wrapper.portal-layout {
  flex-direction: column;
  min-block-size: 100dvh;
}

.portal-layout > .v-main {
  flex: 1 0 auto;
}

.portal-layout > .v-footer {
  flex: 0 0 auto;
}

.portal-barra {
  border-block-start: 4px solid #ffb300;
  border-block-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.portal-marca {
  display: inline-flex;
  gap: .65rem;
  align-items: center;
  font-weight: 750;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-surface));
  text-decoration: none;
}

.portal-marca small {
  display: block;
  margin-block-start: .2rem;
  font-size: .875rem;
  font-weight: 500;
  opacity: .75;
}

.portal-marca-logo {
  block-size: 3.25rem;
  inline-size: auto;
}

.portal-pie {
  color: white;
}

.portal-pie a {
  color: inherit;
}
</style>

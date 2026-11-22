<template>
  <VCard
    class="perfil-card"
    elevation="0"
  >
    <slot />
  </VCard>
</template>

<style scoped>
.perfil-card {
  margin-block-end: 1.25rem;
  padding: 1.5rem;
  border: 1px solid var(--portal-borde);
  border-radius: 0.875rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 18px -4px rgba(0, 0, 0, 0.08);
}
</style>

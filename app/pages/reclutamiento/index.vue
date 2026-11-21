<script setup lang="ts">
definePageMeta({
  layout: 'portal',
  public: true,
  sanctum: { excluded: true },
})

const beneficios = [
  { icono: 'tabler-trending-up', titulo: 'Crecimiento profesional', texto: 'Planes de carrera y capacitación constante.' },
  { icono: 'tabler-heart-handshake', titulo: 'Gran ambiente laboral', texto: 'Somos un equipo que trabaja por el bienestar de nuestros asociados.' },
  { icono: 'tabler-shield-check', titulo: 'Estabilidad', texto: 'Únete a una institución sólida y con trayectoria.' },
]

const datos = [
  { icono: 'tabler-users', texto: 'Equipo humano' },
  { icono: 'tabler-school', texto: 'Capacitación continua' },
  { icono: 'tabler-rocket', texto: 'Oportunidades de crecimiento' },
]
</script>

<template>
  <main class="inicio-pagina">
    <section class="hero" aria-labelledby="titulo-portal">
      <div class="hero-decoracion" aria-hidden="true" />
      <VContainer class="inicio-contenedor hero-contenido">
        <div class="hero-etiqueta">
          <VIcon icon="tabler-sparkles" size="17" aria-hidden="true" />
          <span>Estamos contratando</span>
        </div>

        <h1 id="titulo-portal">Construye tu futuro con Guayacán</h1>

        <p>
          Conoce las oportunidades de Cooperativa Guayacán y forma parte de un
          equipo que trabaja por el bienestar de sus asociados.
        </p>

        <div class="d-flex flex-wrap ga-3">
          <VBtn
            size="large"
            color="#80b94e"
            variant="flat"
            class="hero-boton"
            append-icon="tabler-arrow-right"
            to="/reclutamiento/vacantes"
          >
            Ver vacantes
          </VBtn>

          <VBtn
            size="large"
            variant="outlined"
            color="white"
            class="hero-boton-secundario"
            to="/reclutamiento/registro"
          >
            Crear mi cuenta
          </VBtn>
        </div>

        <ul class="hero-datos">
          <li v-for="dato in datos" :key="dato.texto">
            <VIcon :icon="dato.icono" size="20" aria-hidden="true" />
            <span>{{ dato.texto }}</span>
          </li>
        </ul>
      </VContainer>
    </section>

    <section class="beneficios-seccion">
      <VContainer class="inicio-contenedor">
        <header class="beneficios-cabecera">
          <span class="beneficios-etiqueta">Nuestra cultura</span>
          <h2>Trabaja con nosotros</h2>
          <p>Descubre lo que hace de Cooperativa Guayacán un excelente lugar para desarrollarte.</p>
        </header>

        <VRow>
          <VCol
            v-for="item in beneficios"
            :key="item.titulo"
            cols="12"
            md="4"
          >
            <VCard class="beneficio h-100" elevation="0">
              <div class="beneficio-cuerpo">
                <span class="beneficio-icono">
                  <VIcon :icon="item.icono" size="26" aria-hidden="true" />
                </span>
                <h3>{{ item.titulo }}</h3>
                <p>{{ item.texto }}</p>
              </div>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </section>
  </main>
</template>

<style scoped>
.inicio-pagina {
  --portal-azul: #123e66;
  --portal-azul-oscuro: #0c2944;
  --portal-azul-claro: #1d578c;
  --portal-verde: #80b94e;
  --portal-borde: rgba(var(--v-border-color), var(--v-border-opacity));

  background: rgb(var(--v-theme-background));
}

.inicio-contenedor {
  max-inline-size: 76rem;
}

.hero {
  position: relative;
  overflow: hidden;
  border-block-end: 4px solid var(--portal-verde);
  background: linear-gradient(135deg, var(--portal-azul-oscuro) 0%, var(--portal-azul) 55%, var(--portal-azul-claro) 100%);
  color: #ffffff;
}

.hero-decoracion {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 86% 20%, rgba(128, 185, 78, 0.24) 0%, transparent 44%),
    radial-gradient(circle at 14% 88%, rgba(255, 255, 255, 0.06) 0%, transparent 45%);
}

.hero-contenido {
  position: relative;
  z-index: 1;
  padding-block: clamp(5.5rem, 9vw, 7.5rem) clamp(3.75rem, 6vw, 5.25rem);
}

.hero-etiqueta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-block-end: 1.25rem;
  padding: 0.35rem 0.9rem;
  border: 1px solid rgba(128, 185, 78, 0.35);
  border-radius: 999px;
  background: rgba(128, 185, 78, 0.14);
  color: #a3df6f;
  font-size: 0.875rem;
  font-weight: 600;
}

.hero h1 {
  max-inline-size: 16ch;
  margin: 0;
  color: #ffffff;
  font-size: clamp(2.4rem, 5.5vw, 4.25rem);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -0.035em;
}

.hero p {
  max-inline-size: 46ch;
  margin-block: 1.25rem 2rem;
  color: #d6e4f0;
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  line-height: 1.65;
}

.hero-boton {
  color: #0c2944 !important;
  font-weight: 700;
  border-radius: 0.65rem;
  padding-inline: 1.65rem;
}

.hero-boton-secundario {
  font-weight: 600;
  border-radius: 0.65rem;
  padding-inline: 1.5rem;
}

.hero-datos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 2.5rem 0 0;
  padding: 0;
  list-style: none;
}

.hero-datos li {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  color: #eef5fc;
  font-size: 0.925rem;
  font-weight: 600;
}

.hero-datos .v-icon {
  color: #a3df6f;
}

.beneficios-seccion {
  padding-block: clamp(3.25rem, 6vw, 4.75rem);
}

.beneficios-cabecera {
  margin-block-end: 2.25rem;
}

.beneficios-etiqueta {
  display: inline-block;
  margin-block-end: 0.5rem;
  color: rgb(var(--v-theme-primary));
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.beneficios-cabecera h2 {
  margin: 0;
  color: rgb(var(--v-theme-on-surface));
  font-size: clamp(1.65rem, 3.2vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.beneficios-cabecera p {
  margin: 0.45rem 0 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 1rem;
}

.beneficio {
  border: 1px solid var(--portal-borde);
  border-block-start: 4px solid var(--portal-verde);
  border-radius: 1rem;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.07);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .beneficio:hover {
    transform: translateY(-4px);
    border-color: rgba(var(--v-theme-primary), 0.35);
    box-shadow: 0 14px 28px -4px rgba(0, 0, 0, 0.14);
  }
}

.beneficio-cuerpo {
  padding: 1.75rem;
}

.beneficio-icono {
  display: inline-grid;
  place-items: center;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: 0.75rem;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
}

.beneficio h3 {
  margin: 1.15rem 0 0.5rem;
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.15rem;
  font-weight: 750;
}

.beneficio p {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>

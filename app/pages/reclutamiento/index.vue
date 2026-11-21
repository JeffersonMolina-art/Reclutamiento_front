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
  <main>
    <section class="hero" aria-labelledby="titulo-portal">
      <VContainer class="hero-contenido">
        <div class="hero-etiqueta">
          <VIcon icon="tabler-sparkles" size="18" aria-hidden="true" />
          Estamos contratando
        </div>

        <h1 id="titulo-portal">Construye tu futuro con Guayacán</h1>

        <p>
          Conoce las oportunidades de Cooperativa Guayacán y forma parte de un
          equipo que trabaja por el bienestar de sus asociados.
        </p>

        <div class="d-flex flex-wrap ga-3">
          <VBtn
            size="large"
            color="#ffb300"
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
            to="/reclutamiento/registro"
          >
            Crear mi cuenta
          </VBtn>
        </div>

        <ul class="hero-datos">
          <li v-for="dato in datos" :key="dato.texto">
            <VIcon :icon="dato.icono" size="22" aria-hidden="true" />
            {{ dato.texto }}
          </li>
        </ul>
      </VContainer>
    </section>

    <VContainer class="py-12">
      <h2 class="text-h4 font-weight-bold mb-6">
        Trabaja con nosotros
      </h2>

      <VRow>
        <VCol
          v-for="item in beneficios"
          :key="item.titulo"
          cols="12"
          md="4"
        >
          <VCard class="beneficio h-100 pa-5" variant="outlined">
            <span class="beneficio-icono">
              <VIcon :icon="item.icono" size="27" aria-hidden="true" />
            </span>
            <h3 class="text-h6 font-weight-bold mt-4 mb-2">
              {{ item.titulo }}
            </h3>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ item.texto }}
            </p>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </main>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 85% 20%, #2f8fe0 0, transparent 38%),
    radial-gradient(circle at 70% 90%, #ffb30055 0, transparent 35%),
    linear-gradient(120deg, #0c2e50 10%, #1b5a96 100%);
  color: white;
}

.hero::before,
.hero::after {
  position: absolute;
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.hero::before {
  inset-block-start: -8rem;
  inset-inline-end: -6rem;
  inline-size: 26rem;
  block-size: 26rem;
  border: 2px solid #ffffff2e;
  animation: flotar 9s ease-in-out infinite;
}

.hero::after {
  inset-block-end: -7rem;
  inset-inline-end: 18%;
  inline-size: 18rem;
  block-size: 18rem;
  background: #ffb3002e;
  animation: flotar 12s ease-in-out infinite reverse;
}

@keyframes flotar {
  50% { transform: translateY(1.5rem) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .hero::before,
  .hero::after { animation: none; }
}

.hero-contenido {
  position: relative;
  z-index: 1;
  padding-block: clamp(4rem, 9vw, 7.5rem);
}

.hero-etiqueta {
  display: inline-flex;
  gap: .4rem;
  align-items: center;
  margin-block-end: 1.25rem;
  padding: .4rem .9rem;
  border: 1px solid #ffffff40;
  border-radius: 999px;
  background: #ffffff1f;
  font-size: .9rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.hero-datos {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
}

.hero-datos li {
  display: inline-flex;
  gap: .5rem;
  align-items: center;
  padding: .5rem 1rem;
  border-radius: .75rem;
  background: #ffffff1a;
  font-weight: 600;
}

.hero h1 {
  color: #fff;
  max-inline-size: 14ch;
  margin: 0;
  font-size: clamp(2.6rem, 7vw, 5.4rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -.045em;
}

.hero p {
  color: #fff;
  max-inline-size: 43ch;
  margin-block: 1.25rem 1.75rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.6;
}

.hero-boton {
  color: #102e4d;
}

.beneficio {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 1rem;
}

.beneficio-icono {
  display: inline-grid;
  place-items: center;
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: .75rem;
  background: #e9f2fa;
  color: #153e66;
}
</style>

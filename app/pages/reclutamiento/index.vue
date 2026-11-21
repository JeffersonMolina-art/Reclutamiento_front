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
</script>

<template>
  <main>
    <section class="hero" aria-labelledby="titulo-portal">
      <VContainer class="hero-contenido">
        <h1 id="titulo-portal">Construye tu futuro con Guayacán</h1>

        <p>
          Conoce las oportunidades de Cooperativa Guayacán y forma parte de un
          equipo que trabaja por el bienestar de sus asociados.
        </p>

        <div class="d-flex flex-wrap ga-3">
          <VBtn
            size="large"
            color="#d6f0b8"
            class="hero-boton"
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
  background:
    linear-gradient(90deg, #0c2e50 5%, #0c2e50eb 38%, #0c2e5066 100%),
    url('/reclutamiento/equipo.webp') center 44% / cover;
  background-color: #0c2e50;
  color: white;
}

.hero-contenido {
  padding-block: clamp(4rem, 9vw, 7.5rem);
}

.hero h1 {
  max-inline-size: 14ch;
  margin: 0;
  font-size: clamp(2.6rem, 7vw, 5.4rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -.045em;
}

.hero p {
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

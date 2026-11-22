<script setup lang="ts">
type Recurso = 'conocimientos' | 'experiencias' | 'formaciones'

const props = defineProps<{ recurso: Recurso }>()

const items = defineModel<any[]>({ required: true })

const { peticion, token } = useCandidatoSesion()
const { showToastSuccess, showToastError, preguntaEliminar } = useToast()
const mensajeError = (error: any, base: string) => {
  const errores = error?.data?.errors
  const primero = errores ? (Object.values(errores)[0] as string[] | undefined)?.[0] : null

  return primero ?? error?.data?.message ?? base
}

const sesionExpirada = async (error: any) => {
  const estado = error?.statusCode ?? error?.response?.status

  if (estado !== 401 && estado !== 403)
    return false

  token.value = null
  await navigateTo('/reclutamiento/login')

  return true
}

const configuracion = {
  formaciones: {
    titulo: 'Formación académica',
    icono: 'tabler-school',
    iconoVacio: 'tabler-book-2',
    vacio: 'Agrega tus estudios, títulos o carreras.',
    aria: 'formación académica',
    pregunta: '¿Eliminar esta formación académica?',
    principal: (i: any) => i.titulo_carrera || i.nombre,
    secundario: (i: any) => i.titulo_carrera ? i.nombre : '',
  },
  experiencias: {
    titulo: 'Experiencia laboral',
    icono: 'tabler-briefcase',
    iconoVacio: 'tabler-building',
    vacio: 'Agrega los puestos que has desempeñado.',
    aria: 'experiencia laboral',
    pregunta: '¿Eliminar esta experiencia laboral?',
    principal: (i: any) => i.puesto || i.empresa,
    secundario: (i: any) => i.puesto ? i.empresa : '',
  },
  conocimientos: {
    titulo: 'Conocimientos y habilidades',
    icono: 'tabler-bulb',
    iconoVacio: 'tabler-tools',
    vacio: 'Agrega habilidades, herramientas o conocimientos que dominas.',
    aria: 'conocimiento o habilidad',
    pregunta: '¿Eliminar este conocimiento o habilidad?',
    principal: (i: any) => i.descripcion,
    secundario: () => '',
  },
}

const config = computed(() => configuracion[props.recurso])
const esConocimiento = computed(() => props.recurso === 'conocimientos')

const mostrarModal = ref(false)
const itemEditando = ref<any | null>(null)

const formatoFecha = new Intl.DateTimeFormat('es-GT', { month: 'short', year: 'numeric', timeZone: 'UTC' })
const fechaVisible = (f?: string | null) => f ? formatoFecha.format(new Date(f.slice(0, 10))) : ''
const periodo = (item: { fecha_inicio: string; fecha_fin?: string | null }) =>
  `${fechaVisible(item.fecha_inicio)} – ${item.fecha_fin ? fechaVisible(item.fecha_fin) : 'Actualidad'}`

function abrir(item: any | null) {
  itemEditando.value = item
  mostrarModal.value = true
}

async function recargar() {
  const { data } = await peticion<{ data: any[] }>(`/api/portal/perfil/${props.recurso}`)

  items.value = data
}

async function eliminar(item: any) {
  const confirmado = await preguntaEliminar(config.value.pregunta, 'El registro se quitará de tu perfil.')

  if (!confirmado)
    return

  try {
    await peticion(`/api/portal/perfil/${props.recurso}/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter(i => i.id !== item.id)
    showToastSuccess('Registro eliminado.')
  }
  catch (error) {
    if (!(await sesionExpirada(error)))
      showToastError(mensajeError(error, 'No se pudo eliminar el registro'))
  }
}
</script>

<template>
  <VCard
    class="trayectoria-card"
    :class="`trayectoria-card--${recurso}`"
    elevation="0"
  >
    <header class="trayectoria-cabecera">
      <div class="trayectoria-titulo">
        <span class="trayectoria-icono">
          <VIcon
            :icon="config.icono"
            size="24"
          />
        </span>
        <h2>{{ config.titulo }}</h2>
      </div>

      <VBtn
        class="trayectoria-agregar"
        variant="tonal"
        prepend-icon="tabler-plus"
        :aria-label="`Agregar ${config.aria}`"
        @click="abrir(null)"
      >
        Agregar
      </VBtn>
    </header>

    <div
      v-if="!items.length"
      class="trayectoria-vacio"
    >
      <VIcon
        :icon="config.iconoVacio"
        size="22"
      />
      <p>{{ config.vacio }}</p>
    </div>

    <ul
      v-else
      class="trayectoria-lista"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="trayectoria-fila"
      >
        <div class="trayectoria-datos">
          <strong>{{ config.principal(item) }}</strong>
          <span v-if="config.secundario(item)">{{ config.secundario(item) }}</span>
          <VChip
            v-if="esConocimiento && item.nivel"
            class="trayectoria-nivel"
            size="small"
            variant="tonal"
          >
            Nivel {{ item.nivel }}
          </VChip>
          <small
            v-if="!esConocimiento && item.fecha_inicio"
            class="trayectoria-periodo"
          >
            <VIcon
              icon="tabler-calendar"
              size="15"
            />
            {{ periodo(item) }}
          </small>
        </div>

        <div class="trayectoria-acciones">
          <VBtn
            icon="tabler-edit"
            variant="text"
            size="small"
            :aria-label="`Editar ${config.principal(item)}`"
            @click="abrir(item)"
          />
          <VBtn
            icon="tabler-trash"
            variant="text"
            size="small"
            color="error"
            :aria-label="`Eliminar ${config.principal(item)}`"
            @click="eliminar(item)"
          />
        </div>
      </li>
    </ul>

    <PerfilTrayectoriaModal
      v-model:mostrar="mostrarModal"
      :recurso="recurso"
      :item="itemEditando"
      @guardado="recargar"
    />
  </VCard>
</template>

<style scoped>
.trayectoria-card {
  --trayectoria-acento: var(--v-theme-primary);

  margin-block-end: 1.25rem;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 18px;
}

.trayectoria-card--experiencias {
  --trayectoria-acento: var(--v-theme-success);
}

.trayectoria-card--conocimientos {
  --trayectoria-acento: var(--v-theme-info);
}

.trayectoria-cabecera,
.trayectoria-titulo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trayectoria-cabecera {
  flex-wrap: wrap;
  justify-content: space-between;
  margin-block-end: 1rem;
}

.trayectoria-titulo h2 {
  margin: 0;
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: 700;
  line-height: 1.3;
}

.trayectoria-icono {
  display: grid;
  flex: 0 0 44px;
  place-items: center;
  block-size: 44px;
  border-radius: 12px;
  background: rgba(var(--trayectoria-acento), 0.11);
  color: rgb(var(--trayectoria-acento));
}

.trayectoria-agregar {
  color: rgb(var(--trayectoria-acento));
}

.trayectoria-lista {
  display: grid;
  gap: 0.65rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.trayectoria-fila {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 12px;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.trayectoria-fila:hover,
.trayectoria-fila:focus-within {
  border-color: rgba(var(--trayectoria-acento), 0.3);
  background: rgba(var(--trayectoria-acento), 0.045);
}

.trayectoria-datos {
  display: grid;
  gap: 0.25rem;
  min-inline-size: 0;
  overflow-wrap: anywhere;
}

.trayectoria-datos > span,
.trayectoria-periodo,
.trayectoria-vacio {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.trayectoria-periodo {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.trayectoria-nivel {
  justify-self: start;
  margin-block-start: 0.25rem;
  color: rgb(var(--trayectoria-acento));
}

.trayectoria-acciones {
  display: flex;
  flex: 0 0 auto;
  gap: 0.15rem;
}

.trayectoria-vacio {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px dashed rgba(var(--trayectoria-acento), 0.35);
  border-radius: 12px;
  background: rgba(var(--trayectoria-acento), 0.04);
}

.trayectoria-vacio p {
  margin: 0;
}
</style>

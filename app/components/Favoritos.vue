<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import Sortable from "sortablejs";
import type { SortableEvent } from "sortablejs";
import type { UsuarioInterface } from "@/types/usuarios/index";
import { useTheme } from "vuetify";
import type { MenuOpcion, RespuestaRequest } from "@/types/admin/menuOpciones/types";
import { useAbility } from "@casl/vue";
import { can } from "@layouts/plugins/casl";
import { useIsMobile } from "@/composables/useIsMobile";

const { get, put } = useClienteRequest();
const user = useSanctumUser<UsuarioInterface>();
const { showToastError, showToastSuccess } = useToast();
const { isMobile } = useIsMobile();
const vuetifyTheme = useTheme();
const ability = useAbility();

const favoritos = ref<MenuOpcion[]>([]);
const favoritosAElegir = ref<MenuOpcion[]>([]);
const estaEditando = ref(false);
const favoritosList: Ref<HTMLElement | null> = ref(null);
const favoritosAElegirList: Ref<HTMLElement | null> = ref(null);

const obtenerFavoritos = async (): Promise<void> => {
  try {
    const response: RespuestaRequest = await get('api/user-favoritos/de/usuario');
    favoritos.value = <MenuOpcion[]>response.data;
    obtenerFavoritosAElegir();
  } catch (error: any) {
    showToastError(error.message);
  }
};

const obtenerFavoritosAElegir = (): void => {
  try {
    let favoritosDelMenu = <MenuOpcion[]>useState('menu').value;
    favoritosAElegir.value = [];

    for (let opcion of <MenuOpcion[]>aplarOpciones(favoritosDelMenu)) {
      if (!idsFavoritos.value.includes(opcion.id) &&
        opcion.titulo_seccion === null &&
        opcion.ruta !== null) {
        if (ability.can(opcion.action, opcion.subject)) {
          favoritosAElegir.value.push(opcion);
        }
      }
    }
  } catch (error) {
    showToastError('Error al obtener los favoritos a elegir');
  }
};

const aplarOpciones = (options: MenuOpcion[]): MenuOpcion[] => {
  let flattened: MenuOpcion[] = [];
  for (const option of options) {
    const { children, ...currentOption } = option;
    flattened.push(currentOption as MenuOpcion);
    if (children && Array.isArray(children)) {
      flattened = flattened.concat(aplarOpciones(children));
    }
  }
  return flattened;
};

const sincronizarCambios = (event: SortableEvent): void => {
  const oldIndex = event.oldIndex as number;
  const newIndex = event.newIndex as number;

  const fromList = event.from === favoritosList.value ? favoritos : favoritosAElegir;
  const toList = event.to === favoritosList.value ? favoritos : favoritosAElegir;

  if (fromList === favoritosAElegir && toList === favoritosAElegir) {
    return;
  }

  const [movedItem] = fromList.value.splice(oldIndex, 1);
  toList.value.splice(newIndex, 0, movedItem);

  if (fromList === favoritos || toList === favoritos) {
    actualizarFavoritos();
  }
};

const actualizarFavoritos = async (): Promise<void> => {
  try {
    const response: RespuestaRequest = await put('api/user-favoritos/' + user.value?.id, {
      favoritos: favoritos.value.map(favorito => favorito.id)
    });
    showToastSuccess(response.message);
  } catch (e: any) {
    showToastError(e.message);
  }
};

let sortableFavoritosAElegir: Sortable | null = null;
let sortableFavoritos: Sortable | null = null;

watch(estaEditando, async (value) => {
  if (value) {
    await nextTick();

    if (favoritosAElegirList.value) {
      sortableFavoritosAElegir = new Sortable(favoritosAElegirList.value, {
        group: "shared",
        animation: 150,
        onEnd: sincronizarCambios,
        ghostClass: "sortable-ghost",
        fallbackOnBody: true,
        emptyInsertThreshold: 5,
        sort: false,
      });
    }

    if (favoritosList.value) {
      sortableFavoritos = new Sortable(favoritosList.value, {
        group: "shared",
        animation: 150,
        onEnd: sincronizarCambios,
        ghostClass: "sortable-ghost",
      });
    }
  } else {
    if (sortableFavoritos) {
      sortableFavoritos.destroy();
      sortableFavoritos = null;
    }
    if (sortableFavoritosAElegir) {
      sortableFavoritosAElegir.destroy();
      sortableFavoritosAElegir = null;
    }
  }
});

const colorPrimary = computed(() => {
  const isDarkMode = vuetifyTheme.global.name.value === 'dark';
  return isDarkMode
    ? vuetifyTheme.themes.value.dark.colors.primary
    : vuetifyTheme.themes.value.light.colors.primary;
});

const manejarRuta = (ruta: string): void => {
  navigateTo({ name: ruta });
};

const idsFavoritos = computed(() => {
  return favoritos.value.map(favorito => favorito.id);
});

obtenerFavoritos();
</script>

<template>
  <VContainer fluid>
    <!-- Header con título y botón -->
    <VRow class="mb-4" v-if="can('crear favoritos', 'UserFavorito')">
      <VCol cols="12" class="d-flex align-center justify-space-between flex-wrap ga-3">
        <h4 class="text-h4">Favoritos</h4>

        <VBtn
          v-if="!estaEditando"
          color="primary"
          class="text-none"
          @click="estaEditando = true"
        >
          <VIcon icon="tabler-edit" start />
          Editar favoritos
        </VBtn>

        <VBtn
          v-else
          color="success"
          @click="estaEditando = false"
        >
          <VIcon icon="tabler-check" start />
          Guardar
        </VBtn>
      </VCol>
    </VRow>

    <!-- Lista de favoritos -->
    <VRow v-if="!estaEditando">
      <VCol
        v-for="item in favoritos"
        :key="item.id"
        cols="6"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard
          class="text-center cursor-pointer pa-4"
          @click="manejarRuta(item.ruta)"
          hover
        >
          <div class="d-flex flex-column align-center ga-2">
            <VBtn
              :size="isMobile ? 'large' : 'x-large'"
              :style="{ background: colorPrimary }"
              :icon="item.icono"
            />
            <span :class="isMobile ? 'text-body-2' : 'text-body-1'">
              {{ item?.titulo }}
            </span>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- Lista de favoritos en modo edición -->
    <div v-else ref="favoritosList" class="v-row">
      <VCol
        v-for="item in favoritos"
        :key="item.id"
        cols="6"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard
          class="text-center cursor-move pa-4"
          hover
        >
          <div class="d-flex flex-column align-center ga-2">
            <VBtn
              :size="isMobile ? 'large' : 'x-large'"
              :style="{ background: colorPrimary }"
              :icon="item.icono"
            />
            <span :class="isMobile ? 'text-body-2' : 'text-body-1'">
              {{ item?.titulo }}
            </span>
          </div>
        </VCard>
      </VCol>
    </div>

    <!-- Divisor y favoritos a elegir -->
    <template v-if="estaEditando">
      <VDivider class="my-6" />

      <VRow class="mb-4">
        <VCol cols="12">
          <h5 class="text-h5">Favoritos a elegir</h5>
        </VCol>
      </VRow>

      <div ref="favoritosAElegirList" class="v-row">
        <VCol
          v-for="item in favoritosAElegir"
          :key="item.id"
          cols="6"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard
            class="text-center cursor-move pa-4"
            hover
          >
            <div class="d-flex flex-column align-center ga-2">
              <VBtn
                :size="isMobile ? 'large' : 'x-large'"
                :style="{ background: colorPrimary }"
                :icon="item.icono"
              />
              <span :class="isMobile ? 'text-body-2' : 'text-body-1'">
                {{ item?.titulo }}
              </span>
            </div>
          </VCard>
        </VCol>
      </div>
    </template>
  </VContainer>
</template>

<style scoped>
.sortable-ghost {
  opacity: 0.5;
}

.cursor-move {
  cursor: move;
}

.cursor-pointer {
  cursor: pointer;
}

/* Asegurar que flex-wrap funcione correctamente */
.d-flex.flex-wrap {
  display: flex !important;
  flex-wrap: wrap !important;
}

/* Espaciado entre items */
.ga-4 {
  gap: 1rem;
}
</style>

<script setup lang="ts">
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const AZURE_HOST = "storagegy.blob.core.windows.net";
const ESCALA_PDF = 1.5;
const ZOOM_MINIMO = 0.5;
const ZOOM_MAXIMO = 3;

type ModoVisor = "pdfjs" | "ios" | "iframe" | "vacio";

interface ConfiguracionVisor {
  modo: ModoVisor;
  archivoLocal: boolean;
  esIOS: boolean;
  urlPdfJs: string;
  urlVisor: string;
  urlDescarga: string;
}

const props = withDefaults(defineProps<{
  file?: File | null;
  url?: string | null;
  nombre?: string | null;
  movil?: boolean;
}>(), {
  file: null,
  url: null,
  nombre: null,
  movil: false,
});

const paginas = ref<string[]>([]);
const cargando = ref(false);
const descargando = ref(false);
const error = ref("");

const zoom = ref(1);
const zoomInicial = ref(1);
const distanciaInicial = ref(0);

const configuracionVisor = computed<ConfiguracionVisor>(() => {
  const archivoLocal = Boolean(
    props.file
    && typeof props.file.arrayBuffer === "function",
  );

  let esIOS = false;
  let esAndroid = false;

  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent || "";

    const iphoneOipad
      = /iPhone|iPad|iPod/i.test(userAgent);

    const ipadModoEscritorio
      = navigator.platform === "MacIntel"
      && navigator.maxTouchPoints > 1;

    const android
      = /Android/i.test(userAgent);

    const tabletLinuxTactil
      = /Linux|X11/i.test(userAgent)
      && navigator.maxTouchPoints > 1;

    esIOS = iphoneOipad || ipadModoEscritorio;
    esAndroid = android || tabletLinuxTactil;
  }

  const urlOriginal = props.url || "";

  let urlPdfJs = "";
  let urlVisorIOS = urlOriginal;

  if (urlOriginal && typeof window !== "undefined") {
    try {
      const url = new URL(
        urlOriginal,
        window.location.origin,
      );

      const ruta = `${url.pathname}${url.search}`;

      if (url.pathname.startsWith("/storage/")) {
        const proxy
          = `/api/media/pdf-proxy?tipo=storage&ruta=${
          encodeURIComponent(ruta)
        }`;

        urlPdfJs = proxy;
        urlVisorIOS = proxy;
      }

      else if (url.hostname === AZURE_HOST) {
        urlPdfJs
          = `/api/media/pdf-proxy?tipo=azure&url=${
          encodeURIComponent(url.toString())
        }`;
      }

      else if (url.origin === window.location.origin) {
        urlPdfJs = ruta;
      }
    }
    catch {

    }
  }

  if (archivoLocal) {
    return {
      modo: "pdfjs",
      archivoLocal,
      esIOS,
      urlPdfJs: "",
      urlVisor: "",
      urlDescarga: "",
    };
  }

  if (props.movil && esAndroid && urlPdfJs) {
    return {
      modo: "pdfjs",
      archivoLocal,
      esIOS,
      urlPdfJs,
      urlVisor: "",
      urlDescarga: urlPdfJs,
    };
  }

  if (props.movil && esIOS && urlVisorIOS) {
    return {
      modo: "ios",
      archivoLocal,
      esIOS,
      urlPdfJs,
      urlVisor: urlVisorIOS,
      urlDescarga: urlPdfJs || urlOriginal,
    };
  }

  if (urlOriginal) {
    return {
      modo: "iframe",
      archivoLocal,
      esIOS,
      urlPdfJs,
      urlVisor: urlOriginal,
      urlDescarga: urlPdfJs || urlOriginal,
    };
  }

  return {
    modo: "vacio",
    archivoLocal,
    esIOS,
    urlPdfJs: "",
    urlVisor: "",
    urlDescarga: "",
  };
});

const nombreDocumento = computed(() => {
  return props.file?.name
    || props.nombre
    || "Documento PDF";
});

const nombreArchivoDescarga = computed(() => {
  const nombre
    = props.file?.name
    || props.nombre
    || "documento.pdf";

  if (nombre.toLowerCase().endsWith(".pdf"))
    return nombre;

  return nombre.replace(
    /\.(doc|docx)$/i,
    "",
  ) + ".pdf";
});

const obtenerRespuestaPdf = async (
  url: string,
): Promise<Response> => {
  const respuesta = await fetch(url, {
    credentials: "same-origin",
  });

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo obtener el PDF. HTTP ${respuesta.status}`,
    );
  }

  const tipoContenido
    = respuesta.headers.get("content-type") || "";

  if (tipoContenido.includes("text/html")) {
    throw new Error(
      "La respuesta recibida no corresponde a un PDF.",
    );
  }

  return respuesta;
};

const obtenerOrigenPdf = async () => {
  if (
    configuracionVisor.value.archivoLocal
    && props.file
  ) {
    const contenido = await props.file.arrayBuffer();

    if (contenido.byteLength === 0)
      throw new Error("El archivo PDF está vacío.");

    return {
      data: new Uint8Array(contenido),
    };
  }

  if (!configuracionVisor.value.urlPdfJs)
    return null;

  const respuesta = await obtenerRespuestaPdf(
    configuracionVisor.value.urlPdfJs,
  );

  const contenido = await respuesta.arrayBuffer();

  if (contenido.byteLength === 0)
    throw new Error("La respuesta del PDF está vacía.");

  return {
    data: new Uint8Array(contenido),
  };
};

const renderizarPdf = async () => {
  if (configuracionVisor.value.modo !== "pdfjs")
    return;

  cargando.value = true;
  paginas.value = [];
  error.value = "";

  try {
    const origenPdf = await obtenerOrigenPdf();

    if (!origenPdf)
      throw new Error("No se encontró el documento PDF.");

    const pdf = await pdfjsLib
      .getDocument(origenPdf)
      .promise;

    const paginasRenderizadas: string[] = [];

    for (
      let numeroPagina = 1;
      numeroPagina <= pdf.numPages;
      numeroPagina++
    ) {
      const pagina = await pdf.getPage(numeroPagina);

      const viewport = pagina.getViewport({
        scale: ESCALA_PDF,
      });

      const canvas = document.createElement("canvas");
      const contexto = canvas.getContext("2d");

      if (!contexto)
        continue;

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await pagina.render({
        canvasContext: contexto,
        viewport,
      }).promise;

      paginasRenderizadas.push(
        canvas.toDataURL("image/jpeg", 0.9),
      );
    }

    paginas.value = paginasRenderizadas;

    if (!paginasRenderizadas.length) {
      error.value
        = "No se pudieron renderizar las páginas.";
    }
  }
  catch (err) {
    error.value = err instanceof Error
      ? err.message
      : "No se pudo visualizar el documento PDF.";
  }
  finally {
    cargando.value = false;
  }
};

const obtenerDistancia = (
  touches: TouchList,
): number => {
  const primerDedo = touches[0];
  const segundoDedo = touches[1];

  return Math.hypot(
    segundoDedo.clientX - primerDedo.clientX,
    segundoDedo.clientY - primerDedo.clientY,
  );
};

const iniciarZoomTouch = (event: TouchEvent) => {
  if (event.touches.length !== 2)
    return;

  distanciaInicial.value = obtenerDistancia(
    event.touches,
  );

  zoomInicial.value = zoom.value;
};

const aplicarZoomTouch = (event: TouchEvent) => {
  if (
    event.touches.length !== 2
    || distanciaInicial.value === 0
  ) {
    return;
  }

  event.preventDefault();

  const distanciaActual = obtenerDistancia(
    event.touches,
  );

  const proporcion
    = distanciaActual / distanciaInicial.value;

  zoom.value = Math.min(
    Math.max(
      zoomInicial.value * proporcion,
      ZOOM_MINIMO,
    ),
    ZOOM_MAXIMO,
  );
};

const finalizarZoomTouch = (event: TouchEvent) => {
  if (event.touches.length < 2)
    distanciaInicial.value = 0;
};

const descargarBlob = async (blob: Blob, nombre: string,) => {
  const archivo = new File(
    [blob], nombre,
    {
      type: "application/pdf",
    },
  );

  if (
    configuracionVisor.value.esIOS
    && typeof navigator.share === "function"
    && navigator.canShare?.({
      files: [archivo],
    })
  ) {
    try {
      await navigator.share({
        files: [archivo],
        title: nombre,
      });

      return;
    }
    catch (err: any) {
      if (err?.name === "AbortError")
        return;

      throw err;
    }
  }

  const blobDescarga = configuracionVisor.value.esIOS
    ? new Blob(
      [blob],
      {
        type: "application/octet-stream",
      },
    )
    : blob;

  const urlTemporal = URL.createObjectURL(
    blobDescarga,
  );

  const enlace = document.createElement("a");

  enlace.href = urlTemporal;
  enlace.download = nombre;
  enlace.style.display = "none";

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  setTimeout(() => {
    URL.revokeObjectURL(urlTemporal);
  }, 1000);
};

const descargarPdf = async () => {
  if (descargando.value)
    return;

  descargando.value = true;

  try {
    if (
      configuracionVisor.value.archivoLocal
      && props.file
    ) {
      await descargarBlob(
        props.file,
        nombreArchivoDescarga.value,
      );

      return;
    }

    const url = configuracionVisor.value.urlDescarga;

    if (!url)
      throw new Error("No se encontró la URL del documento.");

    const respuesta = await obtenerRespuestaPdf(url);
    const blobOriginal = await respuesta.blob();

    if (blobOriginal.size === 0)
      throw new Error("El documento descargado está vacío.");

    const blobPdf = blobOriginal.type
      ? blobOriginal
      : new Blob(
        [blobOriginal],
        {
          type: "application/pdf",
        },
      );

    await descargarBlob(
      blobPdf,
      nombreArchivoDescarga.value,
    );
  }
  catch (err) {
    console.error(
      "No se pudo descargar el PDF:",
      err,
    );

    showToastError(
      "No se pudo descargar el documento.",
    );
  }
  finally {
    descargando.value = false;
  }
};

watch(
  [
    () => props.file,
    () => props.url,
    () => props.movil,
  ],
  () => {
    zoom.value = 1;
    zoomInicial.value = 1;
    distanciaInicial.value = 0;
    paginas.value = [];
    error.value = "";

    if (configuracionVisor.value.modo === "pdfjs")
      void renderizarPdf();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="visor-documento">
    <header class="visor-encabezado">
      <div class="visor-acciones">
        <VBtn
          icon="tabler-download"
          size="small"
          variant="text"
          color="white"
          aria-label="Descargar documento"
          title="Descargar documento"
          :loading="descargando"
          :disabled="descargando"
          @click.stop="descargarPdf"
        />
      </div>

      <div class="visor-titulo">
        <VIcon
          icon="tabler-file-type-pdf"
          color="error"
          size="26"
        />

        <span>{{ nombreDocumento }}</span>
      </div>
    </header>

    <!-- Archivo local, Android o tablet Linux -->
    <div
      v-if="configuracionVisor.modo === 'pdfjs'"
      class="visor-contenido visor-pdf-local"
      @touchstart="iniciarZoomTouch"
      @touchmove="aplicarZoomTouch"
      @touchend="finalizarZoomTouch"
      @touchcancel="finalizarZoomTouch"
    >
      <div
        v-if="cargando"
        class="estado-visor"
      >
        <VProgressCircular
          indeterminate
          color="primary"
          size="50"
        />
      </div>

      <div
        v-else-if="error"
        class="estado-visor"
      >
        <VAlert
          type="error"
          variant="tonal"
          class="mensaje-error"
        >
          {{ error }}
        </VAlert>
      </div>

      <div
        v-else
        class="paginas-contenedor"
      >
        <img
          v-for="(pagina, index) in paginas"
          :key="index"
          :src="pagina"
          :alt="`Página ${index + 1}`"
          class="pagina-pdf"
          :style="{
            width: `${zoom * 100}%`,
          }"
        >
      </div>
    </div>

    <!-- Visor nativo para iPhone y iPad -->
    <div
      v-else-if="configuracionVisor.modo === 'ios'"
      class="visor-contenido visor-externo-contenedor"
    >
      <object
        :data="configuracionVisor.urlVisor || undefined"
        type="application/pdf"
        class="visor-externo"
      >
        <embed
          :src="configuracionVisor.urlVisor || undefined"
          type="application/pdf"
          class="visor-externo"
        >

        <p class="mensaje-pdf">
          El navegador no pudo mostrar el PDF.
        </p>
      </object>
    </div>

    <!-- Visor normal para laptop -->
    <div
      v-else-if="configuracionVisor.modo === 'iframe'"
      class="visor-contenido visor-externo-contenedor"
    >
      <iframe
        :src="configuracionVisor.urlVisor || undefined"
        class="visor-externo"
        title="Vista previa del documento PDF"
      />
    </div>

    <div
      v-else
      class="visor-contenido estado-visor"
    >
      <VAlert
        type="error"
        variant="tonal"
        class="mensaje-error"
      >
        No se encontró el documento.
      </VAlert>
    </div>
  </div>
</template>

<style scoped>
.visor-documento {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: #525659;
}

.visor-encabezado {
  display: flex;
  flex: 0 0 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 12px;
  color: white;
  background-color: #323639;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.visor-acciones {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
}

.visor-titulo {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.visor-titulo span {
  overflow: hidden;
  font-size: 0.9rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.visor-contenido {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: #525659;
}

.estado-visor {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.mensaje-error {
  width: 100%;
  max-width: 600px;
}

.visor-pdf-local {
  padding: 16px;
  overflow: auto;
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.paginas-contenedor {
  width: 100%;
  min-width: 100%;
}

.pagina-pdf {
  display: block;
  max-width: none;
  height: auto;
  margin: 0 auto 16px;
  pointer-events: none;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.visor-externo-contenedor {
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.visor-externo {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 100%;
  border: 0;
  background-color: white;
}

.mensaje-pdf {
  padding: 16px;
  color: white;
  text-align: center;
}

@media (max-width: 768px) {
  .visor-encabezado {
    flex-basis: 48px;
    padding: 0 8px;
  }

  .visor-pdf-local {
    padding: 8px;
  }

  .pagina-pdf {
    margin-bottom: 8px;
  }
}
</style>

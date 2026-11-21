<script setup lang="ts">
import * as exifr from 'exifr'
import {
  computed,
  defineOptions,
  nextTick,
  onMounted,
  useAttrs,
  watch,
} from 'vue'

// --- IMPORTS ---
import { GestorDeArchivos } from '@/clases/archivo/GestorArchivos'
import { useNetworkStatus } from '@/composables/Offline/useNetworkStatus'
import { useColaOffline } from '@/composables/Offline/useColaOffline'

defineOptions({ inheritAttrs: false })

// --- PROPS ---
const props = defineProps({
  multiple: { type: Boolean, default: false },
  previsualizarArchivos: { type: Array, default: () => [] },
  name: { type: String, default: '' },
  subidaAutomatica: { type: Boolean, default: false },
  urlSubida: { type: String, default: '' },
  urlEliminacion: { type: String, default: '' },
  archivos: { type: [Array, Object], default: () => [] },
  lectura: { type: Boolean, default: false },
  modelType: { type: String, default: '' },
  modelId: { type: Number, default: 0 },
  coleccion: { type: String, default: '' },
  asociadoId: { type: Number, default: null },
  claseId: { type: Number, default: null },
  tipoId: { type: Number, default: null },
  abrirCamaraDirecto: { type: Boolean, default: false },

  // --- PROPS DE CONTROL ---
  mostrarMenu: { type: Boolean, default: false },

  // --- NUEVA PROP: TAMAÑO MÁXIMO ---
  // Define el límite en Megabytes (Ej: 5, 10, 20). Defecto: 10MB
  maxSizeMb: { type: Number, default: 1 },
})

const emit = defineEmits([
  'update:archivos',
  'archivoSubido',
  'archivoEliminado',
])

// --- COMPOSABLES ---
const { post, deleted } = useClienteRequest()

const { showToastSuccess, showToastError } = useToast()
const attrs = useAttrs()

// --- STATE ---
const gestorArchivos = new GestorDeArchivos(props.multiple ?? false)
const estaArrastrandoArchivo = ref(false)
const input = ref<HTMLInputElement | null>(null)
const archivoParaVisualizar = ref(null)
const dialog = ref(false)
const viewerRefs = ref([])

// --- STATE INTERFAZ ---
const mostrarMenuSeleccion = ref(false)
const mostrarCamaraModal = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const streamCamara = ref<MediaStream | null>(null)

// --- SUBIDA AUTOMTICA ---
const subiendoArchivo = ref(false)
const subidaCompletada = ref(false)

// --- ELIMINACION AUTOMATICA ---
const eliminacionAutomatica = ref(false)
const eliminacionCompleta = ref(false)

// --- ALERTA DE TAMAÑO EXCEDIDO ---
const tamanoExcedido = ref(false)
const mensajeTamanoExcedito = ref(null)

// --- OFFLINE  ----
const { isOnline } = useNetworkStatus()
const { agregar } = useColaOffline()

// ==========================================
// 1. VALIDACIONES (TIPO Y TAMAÑO)
// ==========================================

// Dispositivos moviles-cámara
const camaraActual = ref<'user' | 'environment'>('environment')
const dispositivosVideo = ref<MediaDeviceInfo[]>([])
const indiceCamara = ref(0)

const esIOS = computed(() => {
  if (typeof navigator === 'undefined')
    return false

  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
})

const tieneCoordenadas = async (archivo: File): Promise<boolean> => {
  try {
    if (!archivo.type.startsWith('image/'))
      return false

    const gps = await exifr.gps(archivo)

    console.log('GPS frontend', {
      archivo: archivo.name,
      gps,
    })

    return !!(
      gps
      && typeof gps.latitude === 'number'
      && typeof gps.longitude === 'number'
    )
  }
  catch (error) {
    console.warn('No se pudo leer GPS EXIF', error)

    return false
  }
}

const obtenerDispositivosVideo = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()

  dispositivosVideo.value = devices.filter(d => d.kind === 'videoinput')
}

const aceptaImagenes = computed(() => {
  const accept = (attrs.accept as string) || ''
  if (!accept)
    return true

  return /image|\.jpg|\.jpeg|\.png|\.webp|\.bmp|\*/i.test(accept)
})

const tiposPermitidos = computed(() => {
  const tipos = (attrs.accept as string) ?? 'image/*,.pdf'

  return tipos
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== '')
})

// --- VALIDACIÓN DE TIPO ---
const esTipoPermitido = (archivo: File) => {
  return tiposPermitidos.value.some(tipo => {
    if (tipo.endsWith('/*'))
      return archivo.type.startsWith(tipo.replace('/*', ''))
    else if (tipo.startsWith('.'))
      return archivo.name.toLowerCase().endsWith(tipo.toLowerCase())
    else return archivo.type === tipo
  })
}

// --- NUEVA: VALIDACIÓN DE TAMAÑO ---
const esTamanoValido = (archivo: File) => {
  // Convertimos MB a Bytes (MB * 1024 * 1024)
  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (archivo.size > maxBytes) {
    ((mensajeTamanoExcedito.value = `El archivo "${archivo.name}" excede el límite de ${props.maxSizeMb}MB.`),
      (tamanoExcedido.value = true))

    return false
  }
  tamanoExcedido.value = false

  return true
}

// --- FILTROS PRINCIPALES ---
const filtrarArchivosValidos = (documentos: File[]) => {
  // 1. Filtro por Tipo
  const archivosTipoValido = documentos.filter(archivo => {
    if (esTipoPermitido(archivo)) {
      return true
    }
    else {
      showToastError(`El archivo "${archivo.name}" no es permitido.`)

      return false
    }
  })

  // 2. Filtro por Tamaño (NUEVO)
  return archivosTipoValido.filter(archivo => esTamanoValido(archivo))
}

// ==========================================
// 2. DETECCIÓN DE DISPOSITIVO & CONTROL
// ==========================================

const esMovil = () => {
  if (typeof navigator === 'undefined')
    return false

  const userAgent
    = navigator.userAgent || navigator.vendor || (window as any).opera

  const movilEstandar
    = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  const esIpad
    = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  const linuxTactil = /Linux|X11/i.test(userAgent) && navigator.maxTouchPoints > 1

  return movilEstandar || esIpad || linuxTactil
}

const manejarClickDropzone = () => {
  if (props.lectura)
    return

  if (esMovil()) {
    // Si quieres forzar cámara también en móvil cuando aplique:
    if (aceptaImagenes.value && props.abrirCamaraDirecto) {
      iniciarCamara()

      return
    }

    // @ts-expect-error
    input.value?.click()

    return
  }

  if (
    aceptaImagenes.value && props.abrirCamaraDirecto
  ) {
    iniciarCamara('environment')

    return
  }

  // @ts-expect-error
  input.value?.click()
}

// ==========================================
// 3. LÓGICA MENÚ PC
// ==========================================

const seleccionarOpcionCamara = () => {
  mostrarMenuSeleccion.value = false
  iniciarCamara()
}

const seleccionarOpcionArchivos = () => {
  mostrarMenuSeleccion.value = false
  nextTick(() => {
    // @ts-expect-error
    input.value?.click()
  })
}

// ==========================================
// 4. LÓGICA WEBCAM
// ==========================================

const iniciarCamara = async (modo: 'user' | 'environment' = 'environment') => {
  if (!props.multiple && gestorArchivos.archivos.value?.length > 0) {
    showToastError('Solo se permite un archivo')

    return
  }

  mostrarCamaraModal.value = true
  await nextTick()

  try {
    detenerCamara()
    camaraActual.value = modo

    let constraints: MediaStreamConstraints = {
      video: {
        facingMode: modo,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }

    if (!esIOS.value && dispositivosVideo.value.length > 1) {
      const actual = dispositivosVideo.value[indiceCamara.value]
      if (actual?.deviceId) {
        constraints = {
          video: {
            deviceId: { exact: actual.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }
      }
    }

    streamCamara.value = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoRef.value)
      videoRef.value.srcObject = streamCamara.value
    await obtenerDispositivosVideo()
  }
  catch (err) {
    showToastError('No se pudo acceder a la cámara.')
    cerrarCamara()
  }
}

const cambiarCamara = async () => {
  try {
    if (!esIOS.value && dispositivosVideo.value.length > 1) {
      indiceCamara.value
        = (indiceCamara.value + 1) % dispositivosVideo.value.length
      await iniciarCamara(camaraActual.value)

      return
    }

    camaraActual.value
      = camaraActual.value === 'environment' ? 'user' : 'environment'
    await iniciarCamara(camaraActual.value)
  }
  catch (error) {
    showToastError('No se pudo cambiar la cámara.')
  }
}

const detenerCamara = () => {
  if (streamCamara.value) {
    streamCamara.value.getTracks().forEach(track => track.stop())
    streamCamara.value = null
  }

  if (videoRef.value)
    videoRef.value.srcObject = null
}

const cerrarCamara = () => {
  detenerCamara()
  mostrarCamaraModal.value = false
}

const capturarFoto = () => {
  if (!videoRef.value || !canvasRef.value)
    return
  const video = videoRef.value
  const canvas = canvasRef.value

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const context = canvas.getContext('2d')
  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      async blob => {
        if (blob) {
          const nombreArchivo = `camara_pc_${Date.now()}.jpg`

          const archivoFile = new File([blob], nombreArchivo, {
            type: 'image/jpeg',
          })

          // APLICAMOS FILTRO TAMBIÉN AQUÍ
          const archivosValidos = filtrarArchivosValidos([archivoFile])

          if (archivosValidos.length > 0) {
            if (props.subidaAutomatica)
              await subirArchivo(archivosValidos)
            else await gestorArchivos.agregar(archivosValidos[0])
            emitirArchivosActuales()
            showToastSuccess('Foto capturada')
          }
          cerrarCamara()
        }
      },
      'image/jpeg',
      0.9,
    )
  }
}

// ==========================================
// 5. LÓGICA GENERAL ARCHIVOS
// ==========================================

async function abrirModalPrevisualizacion(archivo) {
  if ((archivo.esWord() || archivo.esExcel()) && archivo.file)
    await archivo.generarPreview(false)

  archivoParaVisualizar.value = archivo
  dialog.value = true
}

const abrirViewer = async idx => {
  await nextTick()

  const el = viewerRefs.value[idx]
  if (el && el.$viewer)
    el.$viewer.show()
}

const normalizarArchivo = async (archivo: File): Promise<File> => {
  const contenido = await archivo.arrayBuffer()

  return new File([contenido], archivo.name, {
    type: archivo.type || 'application/octet-stream',
    lastModified: archivo.lastModified,
  })
}

const onArchivoSeleccionado = async (archivos: File | File[]) => {
  if (props.lectura)
    return

  const archivosArray = Array.isArray(archivos) ? archivos : [archivos]

  if (!props.multiple && archivosArray.length > 1) {
    showToastError('Solo se permite un archivo')

    return
  }

  const archivosProcesados = esMovil()
    ? await Promise.all(archivosArray.map(normalizarArchivo))
    : archivosArray

  const archivosValidos = filtrarArchivosValidos(archivosProcesados)

  if (archivosValidos.length === 0)
    return

  for (const archivo of archivosValidos) {
    if (!archivo.type.startsWith('image/'))
      continue

    try {
      const gps = await exifr.gps(archivo)

      const latitude
        = typeof gps?.latitude === 'number' ? gps.latitude : null

      const longitude
        = typeof gps?.longitude === 'number' ? gps.longitude : null

      const tieneGpsReal = latitude !== null && longitude !== null

      console.log({
        archivo: archivo.name,
        latitude,
        longitude,
        tieneGpsReal,
      })

      if (tieneGpsReal) {
        showToastSuccess(
          `GPS detectado: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        )
      }
      else {
        console.warn(`La imagen "${archivo.name}" no trae coordenadas válidas.`)
      }
    }
    catch (error) {
      console.error('Error leyendo GPS EXIF', error)
    }
  }

  if (props.subidaAutomatica)
    await subirArchivo(archivosValidos)
  else await gestorArchivos.agregar(archivosValidos)

  emitirArchivosActuales()
}

async function documentoCargado(evento: DragEvent) {
  estaArrastrandoArchivo.value = false

  const archivosCargados = Array.from(evento.dataTransfer?.files || [])
  if (
    !props.multiple
    && (archivosCargados.length > 1 || gestorArchivos.archivos.value.length > 0)
  ) {
    showToastError('Solo se permite un archivo')

    return
  }

  // APLICAMOS FILTRO UNIFICADO (TIPO + TAMAÑO)
  const archivosValidos = filtrarArchivosValidos(archivosCargados)

  if (props.subidaAutomatica && archivosValidos.length > 0)
    await subirArchivo(archivosValidos)
  else if (archivosValidos.length > 0)
    await gestorArchivos.agregar(archivosValidos)

  emitirArchivosActuales()
}

function emitirArchivosActuales() {
  const archivos = gestorArchivos.archivos.value.map(
    archivo =>
      archivo.file || {
        id: archivo.id,
        url: archivo.previewUrl,
      },
  )

  emit('update:archivos', archivos)
}

const procesarPrevisualizaciones = () => {
  // @ts-expect-error
  if (props.previsualizarArchivos && tieneDatos(props.previsualizarArchivos))
    gestorArchivos.agregar(props.previsualizarArchivos)
}

const manejarDragOver = () => {
  if (!props.lectura)
    estaArrastrandoArchivo.value = true
}

const manejarDragLeave = () => {
  if (!props.lectura)
    estaArrastrandoArchivo.value = false
}

const manejarDrop = e => {
  if (!props.lectura)
    documentoCargado(e)
}

const eliminarArchivo = async archivo => {
  if (props.urlEliminacion && !archivo.file) {
    try {
      eliminacionAutomatica.value = true
      eliminacionCompleta.value = false

      const response = await deleted(`${props.urlEliminacion}/${archivo.id}`)

      if (tieneDatos(response?.message)) {
        eliminacionAutomatica.value = false
        eliminacionCompleta.value = true

        setTimeout(() => {
          eliminacionCompleta.value = false
        }, 2500)
      }
    }
    catch (error) {
      eliminacionAutomatica.value = false
      eliminacionCompleta.value = false
      manejaError(error)
    }
  }
  gestorArchivos.eliminarPorId(archivo.id)
  emitirArchivosActuales()
  emit('archivoEliminado', archivo)
}

const subirArchivo = async archivosCargados => {
  if (!props.subidaAutomatica)
    return

  // 🌐 SI ESTÁ OFFLINE: Encolamos en IndexedDB con tu estructura de payload inteligente
  if (!isOnline.value) {
    if (!archivosCargados || archivosCargados.length === 0)
      return

    try {
      subiendoArchivo.value = true

      // Preparamos el payload con los archivos File nativos y sus metadatos
      const payloadOffline = {
        name: props.name,
        archivos: props.multiple ? archivosCargados : archivosCargados[0],
        model_type: props.modelType,
        model_id: props.modelId,
        coleccion_name: props.coleccion,
        asociado_id: props.asociadoId,
        clase_id: props.claseId,
        tipo_id: props.tipoId,
      }

      // Se guarda en la tabla 'pendientes' con prioridad automática
      await agregar(props.urlSubida, 'POST', payloadOffline)

      // Agregamos provisionalmente al gestor visual para que el usuario vea su archivo en pantalla
      for (const archivo of archivosCargados)
        await gestorArchivos.agregar(archivo)

      emitirArchivosActuales()

      subiendoArchivo.value = false
      subidaCompletada.value = true
      showToastSuccess('Sin conexión. Archivo guardado localmente para sincronizar después.')

      setTimeout(() => {
        subidaCompletada.value = false
      }, 2500)

      const archivosEmitidos = gestorArchivos.archivos.value.map(a => ({
        id: a.id,
        url: a.urlPrevisualizacion,
      }))

      emit(
        'archivoSubido',
        props.multiple ? archivosEmitidos : archivosEmitidos[archivosEmitidos.length - 1],
      )
    }
    catch (error) {
      subiendoArchivo.value = false
      showToastError('No se pudo guardar el archivo localmente.')
      console.error(error)
    }

    return
  }

  const formData = new FormData()

  // 1. Encendemos la animación de carga interna
  subiendoArchivo.value = true
  subidaCompletada.value = false

  if (props.multiple)
    archivosCargados.forEach(a => a && formData.append(`${props.name}[]`, a))
  else if (archivosCargados[0])
    formData.append(props.name, archivosCargados[0])

  formData.append('model_type', props.modelType)

  // @ts-expect-error
  formData.append('model_id', props.modelId)
  formData.append('coleccion_name', props.coleccion)

  // @ts-expect-error
  if (props.asociadoId)
    formData.append('asociado_id', props.asociadoId)

  // @ts-expect-error
  if (props.claseId)
    formData.append('clase_id', props.claseId)

  // @ts-expect-error
  if (props.tipoId)
    formData.append('tipo_id', props.tipoId)

  try {
    const response = await post(props.urlSubida, formData)

    await gestorArchivos.agregar(response.data)

    // 2. Cambiamos a estado "Hecho" y quitamos la barra de carga
    subiendoArchivo.value = false
    subidaCompletada.value = true

    // Ocultamos el mensaje de "Hecho" tras 2.5 segundos para mostrar el archivo
    setTimeout(() => {
      subidaCompletada.value = false
    }, 2500)

    emit('archivoSubido', response.data)
  }
  catch (error) {
    subiendoArchivo.value = false
    subidaCompletada.value = false

    /* @ts-expect-error */
    manejaError(error)
  }
}

const urlArchivoParaVisualizar = computed(() => {
  const archivo = archivoParaVisualizar.value

  if (!archivo)
    return null

  return archivo.obtenerUrlParaModal?.()
    || archivo.urlPrevisualizacion
    || archivo.url
    || null
})

const obtenerUrlArchivo = (archivo: any): string | null => {
  return archivo.obtenerUrlParaModal?.()
    || archivo.urlPrevisualizacion
    || archivo.url
    || null
}

onMounted(async () => {
  procesarPrevisualizaciones()

  if (props.subidaAutomatica && !props.urlSubida)
    throw new Error('[InputFile] URL Subida requerida.')

  if (
    typeof navigator !== 'undefined'
    && navigator.mediaDevices?.enumerateDevices
  ) {
    try {
      await obtenerDispositivosVideo()
    }
    catch (error) {
      // opcional: no mostramos error porque aún no es crítico
      console.warn(
        '[InputFile] No se pudieron obtener los dispositivos de video.',
        error,
      )
    }
  }
})

onUnmounted(() => {
  detenerCamara()
})

watch(() => props.previsualizarArchivos, procesarPrevisualizaciones, {
  deep: false,
})
</script>

<template>
  <VRow
    ref="dropzone"
    dense
    class="mb-5 preview-dropzone text-center justify-center align-center position-relative"
    :class="{
      'dragging': estaArrastrandoArchivo,
      'modo-lectura': lectura,
      'disabled-zone': subiendoArchivo,
    }"
    @click="manejarClickDropzone"
    @dragover.prevent="manejarDragOver"
    @dragleave="manejarDragLeave"
    @drop.prevent="manejarDrop"
  >
    <div
      v-if="!gestorArchivos.archivos.value?.length"
      class="dropzone-message d-flex flex-column align-center"
    >
      <VIcon
        size="48"
        class="tabler-cloud-upload mb-2"
        color="primary"
      />
      <p class="drop-text mb-1">
        {{
          esMovil()
            ? "Toca para agregar"
            : aceptaImagenes && !abrirCamaraDirecto
              ? "Click o arrastra archivos aquí"
              : "Click para subir archivos"
        }}
      </p>
      <span class="text-caption text-disabled">Max: {{ props.maxSizeMb }}MB</span>
    </div>

    <template v-else>
      <div
        v-for="(archivo, i) in gestorArchivos.archivos.value"
        :key="archivo.id"
        style="width: 250px"
        class="text-center ma-2"
      >
        <VCard
          style="padding: 10px"
          class="fill-height"
          @click.stop
        >
          <div
            v-if="archivo.esImagen()"
            :ref="(el) => (viewerRefs[i] = el)"
            v-viewer
            style="cursor: pointer"
          >
            <img
              class="preview-frame"
              :src="archivo.urlPrevisualizacion"
            >
          </div>
          <MiniaturaPdf
            v-if="archivo.esPdf() && esMovil()"
            :file="archivo.file"
            :url="obtenerUrlArchivo(archivo)"
          />

          <iframe
            v-else-if="archivo.esPdf()"
            class="preview-frame"
            :src="archivo.urlPrevisualizacion"
          />
          <iframe
            v-else-if="archivo.esWord()"
            class="preview-frame word-miniatura"
            :src="archivo.urlPrevisualizacion"
            title="Vista previa Word"
          />
          <iframe
            v-else-if="archivo.esExcel()"
            class="preview-frame excel-miniatura"
            :src="archivo.urlPrevisualizacion"
            title="Vista previa Excel"
          />
          <div class="text-end mt-3">
            <VBtn
              icon="tabler-eye"
              class="mr-1"
              size="small"
              variant="outlined"
              @click.stop="
                archivo.esImagen()
                  ? abrirViewer(i)
                  : abrirModalPrevisualizacion(archivo)
              "
            />
            <VBtn
              v-if="!lectura"
              icon="tabler-trash"
              color="error"
              size="small"
              variant="outlined"
              @click.stop="eliminarArchivo(archivo)"
            />
          </div>
        </VCard>
      </div>
    </template>

    <!-- SUBIDA DE ARCHIVO MENSAJE DINAMICO   -->
    <div
      v-if="subiendoArchivo"
      class="bottom-progress-bar animate-fade-in"
    >
      <VProgressLinear
        indeterminate
        color="primary"
        height="6"
        striped
      />
      <div class="bottom-bar-text py-1 px-3 d-flex align-center justify-center">
        <VIcon
          icon="tabler-loader-2"
          class="animate-spin mr-2"
          size="14"
          color="primary"
        />
        <span class="text-caption font-weight-bold text-primary">Subiendo archivo...</span>
      </div>
    </div>
    <div
      v-else-if="subidaCompletada"
      class="bottom-success-bar animate-fade-in"
    >
      <div class="py-1 px-3 d-flex align-center justify-center">
        <VIcon
          icon="tabler-circle-check-filled"
          color="primary"
          size="16"
          class="mr-2 animate-pulse"
        />
        <span class="text-caption font-weight-bold text-primary">¡Hecho correctamente!</span>
      </div>
    </div>
    <!-- ELIMINACION ARCHIVO AUTOMTICAMENTE   -->
    <div
      v-if="eliminacionAutomatica && !subiendoArchivo"
      class="bottom-progress-bar animate-fade-in"
    >
      <VProgressLinear
        indeterminate
        color="error"
        height="6"
        striped
      />
      <div class="bottom-bar-text py-1 px-3 d-flex align-center justify-center">
        <VIcon
          icon="tabler-loader-2"
          class="animate-spin mr-2"
          size="14"
          color="error"
        />
        <span class="text-caption font-weight-bold text-error">Eliminado archivo...</span>
      </div>
    </div>
    <div
      v-else-if="eliminacionCompleta"
      class="bottom-success-bar animate-fade-in is-error"
    >
      <div class="py-1 px-3 d-flex align-center justify-center">
        <VIcon
          icon="tabler-circle-check-filled"
          color="error"
          size="16"
          class="mr-2 animate-pulse"
        />
        <span class="text-caption font-weight-bold text-error">¡Eliminacion correctamente!</span>
      </div>
    </div>
    <!-- TAMAÑO EXCEDIDO    -->
    <div
      v-if="tamanoExcedido && !subiendoArchivo"
      class="bottom-success-bar animate-fade-in is-error"
    >
      <div class="py-1 px-3 d-flex align-center justify-center">
        <VIcon
          icon="tabler-circle-check-filled"
          color="error"
          size="16"
          class="mr-2 animate-pulse"
        />
        <span class="text-caption font-weight-bold text-error">{{
            mensajeTamanoExcedito
          }}</span>
      </div>
    </div>
  </VRow>

  <VFileInput
    v-bind="$attrs"
    ref="input"
    :model-value="[]"
    class="d-none"
    :multiple="multiple"
    @update:model-value="onArchivoSeleccionado"
  />

  <VDialog
    v-model="mostrarMenuSeleccion"
    max-width="400"
    content-class="dialog-center"
  >
    <VCard
      class="glass-modal rounded-xl"
      theme="dark"
    >
      <VCardTitle class="text-center pt-5 pb-2 text-h6 font-weight-bold">
        ¿Cómo deseas subir el archivo?
      </VCardTitle>

      <VCardText class="pb-5">
        <VListItem
          v-if="aceptaImagenes"
          class="mb-3 rounded-lg option-item"
          @click="seleccionarOpcionCamara"
        >
          <div class="d-flex align-center justify-center py-2">
            <VIcon
              icon="tabler-camera"
              color="primary"
              size="24"
              class="mr-3"
            />
            <span class="text-body-1 font-weight-medium">Usar Webcam</span>
          </div>
        </VListItem>

        <VListItem
          class="rounded-lg option-item"
          @click="seleccionarOpcionArchivos"
        >
          <div class="d-flex align-center justify-center py-2">
            <VIcon
              icon="tabler-folder-open"
              color="secondary"
              size="24"
              class="mr-3"
            />
            <span class="text-body-1 font-weight-medium">Explorador de Archivos</span>
          </div>
        </VListItem>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog
    v-model="mostrarCamaraModal"
    persistent
    max-width="760"
    :fullscreen="esMovil()"
  >
    <VCard class="camera-modal">
      <VToolbar
        density="comfortable"
        color="transparent"
        class="camera-toolbar px-2"
      >
        <div class="camera-toolbar-title">
          Tomar fotografía
        </div>

        <VSpacer />

        <VBtn
          icon="tabler-x"
          variant="text"
          color="white"
          class="camera-close-btn"
          @click="cerrarCamara"
        />
      </VToolbar>

      <VCardText class="pa-0">
        <div class="camera-stage">
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="camera-video"
          />

          <canvas
            ref="canvasRef"
            class="d-none"
          />

          <div class="camera-overlay">
            <div class="camera-guide" />

            <div class="camera-floating-top">
              <VBtn
                v-if="aceptaImagenes"
                icon="tabler-camera-rotate"
                size="large"
                color="white"
                variant="flat"
                class="camera-fab camera-fab-switch"
                @click="cambiarCamara"
              />
            </div>

            <div class="camera-floating-bottom">
              <button
                type="button"
                class="camera-capture-btn"
                @click="capturarFoto"
              >
                <span class="camera-capture-ring" />
                <span class="camera-capture-core" />
              </button>
            </div>

            <div
              v-if="aceptaImagenes"
              class="camera-switch-hint"
              @click="cambiarCamara"
            >
              <VIcon
                icon="tabler-camera-rotate"
                size="18"
                class="mr-1"
              />
              <span>Cambiar cámara</span>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>
  </VDialog>

  <VDialog
    v-model="dialog"
    width="80vw"
    class="dialog-viewport"
    persistent
  >
    <DialogCloseBtn
      class="z-10"
      @click="dialog = false"
    />
    <VCard class="visor-card">
      <VCardText class="visor-contenido">
        <VisorPdf
          v-if="archivoParaVisualizar?.esPdf()"
          :key="archivoParaVisualizar.id"
          :file="archivoParaVisualizar.file || null"
          :url="urlArchivoParaVisualizar"
          :nombre="archivoParaVisualizar.nombre"
          :movil="esMovil()"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.glass-modal {
  background-color: rgba(15, 15, 15, 0.1) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.option-item {
  background-color: rgba(15, 15, 15, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.option-item:hover {
  background-color: rgba(15, 15, 15, 0.1);
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.glass-modal .v-card-title {
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.5px;
}

.dialog-viewport >>> .v-overlay__content {
  height: 85vh;
}

.preview-dropzone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.5);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 200px;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}

.preview-dropzone:hover {
  background-color: rgba(var(--v-theme-primary), 0.045);
}

.preview-dropzone.modo-lectura {
  cursor: default;
  border-style: solid;
}

.preview-frame {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.dropzone-message {
  width: 100%;
  color: #999;
  font-size: 1rem;
  font-weight: 500;
  user-select: none;
}

.d-none {
  display: none !important;
}

.excel-miniatura {
  background-color: #fff;
}

/* 2. Mantén estas reglas tal cual para controlar la posición y las animaciones */
.bottom-progress-bar,
.bottom-success-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.bottom-success-bar {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-top: 2px solid rgb(var(--v-theme-primary));
}

/* --- NUEVO: ESTILO CUANDO SE ELIMINA (ÉXITO ROJO) --- */
.bottom-success-bar.is-error {
  background-color: rgba(var(--v-theme-error), 0.08) !important;
  border-top: 2px solid rgb(var(--v-theme-error)) !important;
}

.bottom-bar-text {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.disabled-zone {
  opacity: 0.85;
  padding-bottom: 45px !important; /* Agrega espacio abajo para que las barras no tapen tus elementos */
  transition: all 0.3s ease;
}

/* modal camara */
.camera-modal {
  background: #0b0d12 !important;
  color: white;
  border-radius: 20px !important;
  overflow: hidden;
}

.camera-toolbar {
  min-height: 64px;
  padding-inline: 8px;
  background: linear-gradient(
    to bottom,
    rgba(11, 13, 18, 0.96),
    rgba(11, 13, 18, 0.72)
  );
}

.camera-toolbar-title {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  max-width: calc(100% - 56px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-close-btn {
  flex-shrink: 0;
}

.camera-stage {
  position: relative;
  background: #000;
  min-height: 320px;
  max-height: calc(100vh - 72px);
  overflow: hidden;
}

.camera-video {
  display: block;
  width: 100%;
  height: min(calc(100vh - 72px), 640px);
  object-fit: cover;
  background: #000;
}

.camera-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.camera-guide {
  position: absolute;
  inset: 24px;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.camera-guide::before,
.camera-guide::after {
  content: "";
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.12);
}

.camera-guide::before {
  left: 33.33%;
}

.camera-guide::after {
  left: 66.66%;
}

.camera-floating-top {
  position: absolute;
  top: 16px;
  right: 16px;
  pointer-events: auto;
}

.camera-floating-bottom {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  pointer-events: auto;
}

.camera-fab {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.14) !important;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.camera-capture-btn {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.14) inset;
}

.camera-capture-ring {
  position: absolute;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.95);
}

.camera-capture-core {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: inset 0 -3px 8px rgba(0, 0, 0, 0.08);
}

.camera-capture-btn:active {
  transform: scale(0.96);
}

.camera-switch-hint {
  position: absolute;
  left: 50%;
  bottom: 122px;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  font-size: 0.84rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  pointer-events: auto;
  cursor: pointer;
}

@media (max-width: 600px) {
  .camera-modal {
    border-radius: 0 !important;
  }

  .camera-toolbar {
    min-height: 56px;
  }

  .camera-toolbar-title {
    font-size: 0.95rem;
    max-width: calc(100% - 52px);
  }

  .camera-stage {
    min-height: calc(100vh - 56px);
    max-height: calc(100vh - 56px);
  }

  .camera-video {
    height: calc(100vh - 56px);
  }

  .camera-guide {
    inset: 16px;
    border-radius: 16px;
  }

  .camera-floating-top {
    top: 14px;
    right: 14px;
  }

  .camera-floating-bottom {
    bottom: 22px;
  }

  .camera-capture-btn {
    width: 78px;
    height: 78px;
  }

  .camera-capture-ring {
    width: 78px;
    height: 78px;
  }

  .camera-capture-core {
    width: 54px;
    height: 54px;
  }

  .camera-switch-hint {
    bottom: 112px;
    font-size: 0.78rem;
    padding: 7px 12px;
    max-width: calc(100% - 32px);
    white-space: nowrap;
  }
}
.camera-toolbar-title {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.2;
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 56px);
}

.pdf-miniatura {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  background-color: rgba(var(--v-theme-error), 0.05);
}

.pdf-miniatura span {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.visor-card {
  height: 85vh;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.visor-contenido {
  flex: 1;
  min-height: 0;
  padding: 0 !important;
  overflow: hidden;
}
</style>

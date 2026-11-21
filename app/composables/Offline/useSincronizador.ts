import { ref, watch } from 'vue' // <-- 1. Importa onMounted
import { useNetworkStatus } from './useNetworkStatus'
import { type PeticionOffline, useColaOffline } from './useColaOffline'

export const useSincronizador = () => {
  const { isOnline, forzarOffline } = useNetworkStatus()
  const { obtenerPendientes, eliminar } = useColaOffline()

  // Importas las funciones de tu cliente HTTP personalizado
  const sincronizando = ref(false)

  // Ejecutor completamente dinámico
  const ejecutarPeticionDinamica = async (item: PeticionOffline) => {
    const { post, put, get } = useClienteRequest()

    // Rutea dinámicamente según el método que se guardó
    let payloadAEnviar = item.payload

    // VERIFICACIÓN INTELIGENTE: Si el payload contiene una estructura de archivos offline
    if (payloadAEnviar && typeof payloadAEnviar === 'object' && 'archivos' in payloadAEnviar) {
      const formData = new FormData()
      const { archivos, name, model_type, model_id, coleccion_name, asociado_id, clase_id, tipo_id } = payloadAEnviar

      // Reconstruimos el FormData exactamente como lo espera tu backend en Laravel
      if (Array.isArray(archivos))
        archivos.forEach((file: any) => formData.append(`${name}[]`, file))
      else
        formData.append(name, archivos)

      formData.append('model_type', model_type)
      formData.append('model_id', String(model_id))
      formData.append('coleccion_name', coleccion_name)

      if (asociado_id)
        formData.append('asociado_id', String(asociado_id))
      if (clase_id)
        formData.append('clase_id', String(clase_id))
      if (tipo_id)
        formData.append('tipo_id', String(tipo_id))

      payloadAEnviar = formData
    }
    switch (item.metodo) {
      case 'POST':
        return await post(item.url, payloadAEnviar)
      case 'PUT':
        return await put(item.url, payloadAEnviar)
      case 'GET':
        return await get(item.url, { params: payloadAEnviar })
      default:
        // Fallback genérico si usas $fetch directo de Nuxt
        return await $fetch(item.url, {
          method: item.metodo,
          body: payloadAEnviar,
        })
    }
  }

  const procesarCola = async () => {
    if (!import.meta.client || !navigator.onLine || sincronizando.value)
      return

    sincronizando.value = true

    const items = await obtenerPendientes()

    for (const item of items) {
      if (!navigator.onLine)
        break

      try {
        await ejecutarPeticionDinamica(item)

        // Se envió correctamente, lo quitamos de IndexedDB
        await eliminar(item.id)
        console.log(`Sincronizado [${item.metodo}]: ${item.url}`)
      }
      catch (error: any) {
        const esFalloRed = error.name === 'TypeError' || !error.status
        if (esFalloRed) {
          forzarOffline()
          break
        }
        else {
          console.error(`Error de servidor (${item.url}):`, error)
        }
      }
    }

    sincronizando.value = false
  }

  watch(isOnline, nuevoEstado => {
    if (nuevoEstado)
      procesarCola()
  })
  onMounted(() => {
    if (isOnline.value)
      procesarCola()
  })

  return {
    procesarCola,
    sincronizando,
  }
}

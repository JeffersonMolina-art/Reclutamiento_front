import { ref } from 'vue'

const isOnline = ref(true)
let eventosRegistrados = false

export const useNetworkStatus = () => {
  if (import.meta.client && !eventosRegistrados) {
    isOnline.value = navigator.onLine

    const actualizarEstado = () => {
      isOnline.value = navigator.onLine
    }

    const prevenirRecarga = (e: BeforeUnloadEvent) => {
      if (!isOnline.value) {
        e.preventDefault()
        e.returnValue = 'Estás sin internet. Tus datos locales podrían perderse.'
      }
    }

    window.addEventListener('online', actualizarEstado)
    window.addEventListener('offline', actualizarEstado)
    window.addEventListener('beforeunload', prevenirRecarga)

    eventosRegistrados = true
  }

  const forzarOffline = () => {
    isOnline.value = false
  }

  return {
    isOnline,
    forzarOffline,
  }
}

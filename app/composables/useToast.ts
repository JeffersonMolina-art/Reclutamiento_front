import { cookieRef } from '@layouts/stores/config'
import Swal from 'sweetalert2'
import { useToast as useToastification } from 'vue-toastification'
import ToasMensajeNotificacion from '../components/toast/ToasMensajeNotificacion.vue'
import 'vue-toastification/dist/index.css'

export default function useToast() {
  // Función para actualizar variables CSS dinámicamente según tema
  const setThemeColors = () => {
    const root = document.documentElement
    const isDark = cookieRef('tema_color').value === 'dark'

    root.style.setProperty('--toast-bg', isDark ? '#25293C' : '#ffffff')
    root.style.setProperty('--toast-text', isDark ? '#ffffff' : '#000000')
    root.style.setProperty('--toast-success', '#4caf50')
    root.style.setProperty('--toast-error', '#f44336')
    root.style.setProperty('--toast-warning', '#ff9800')
    root.style.setProperty('--toast-info', '#2196f3')
  }

  const toast = useToastification()

  // Opciones base para toasts con clase custom para aplicar estilos CSS
  const toastOptions = {
    position: 'bottom-right',
    toastClassName: 'custom-toast',
    bodyClassName: 'custom-toast-body',
  }

  const showToastSuccess = (message: string, options?: object) => {
    setThemeColors()
    toast.success(message, { ...toastOptions, ...options })
  }

  const showToastError = (message: string, options?: object) => {
    setThemeColors()
    toast.error(message, { ...toastOptions, ...options })
  }

  const showToastInfo = (message: string, options?: object) => {
    setThemeColors()
    toast.info(message, { ...toastOptions, ...options })
  }

  const showToastWarning = (message: string, options?: object) => {
    setThemeColors()
    toast.warning(message, { ...toastOptions, ...options })
  }

  const showToasMensajeNotificacion = ({
                                          nombre,
                                          titulo,
                                          mensaje,
                                          foto,
                                        }: {
    nombre?: string
    titulo?: string
    mensaje?: string
    foto?: string
  }) => {
    setThemeColors()

    toast(
      {
        component: ToasMensajeNotificacion,
        props: {
          nombre,
          titulo,
          mensaje,
          foto,
        },
      },
      {
        ...toastOptions,
        timeout: 6000,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        icon: false,
      },
    )
  }


  const toastSweet = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen(popup: HTMLElement) {
      popup.onmouseenter = Swal.stopTimer
      popup.onmouseleave = Swal.resumeTimer
    },
  })

  const toastSweetSuccess = (message: string) => {
    toastSweet.fire({
      icon: 'success',
      title: message,
      iconColor: 'success',
      background: cookieRef('tema_color').value === 'dark' ? '#25293C' : '#fff',
      customClass: cookieRef('tema_color').value === 'dark' ? 'text-white' : 'text-black',
    })
  }

  const toastSweetError = (message: string) => {
    toastSweet.fire({
      icon: 'error',
      title: message,
      iconColor: 'error',
      background: cookieRef('tema_color').value === 'dark' ? '#25293C' : '#fff',
      customClass: cookieRef('tema_color').value === 'dark' ? 'text-white' : 'text-black',
    })
  }

  const toastSweetWarning = (message: string) => {
    toastSweet.fire({
      icon: 'warning',
      title: message,
      iconColor: 'warning',
      background: cookieRef('tema_color').value === 'dark' ? '#25293C' : '#fff',
      customClass: cookieRef('tema_color').value === 'dark' ? 'text-white' : 'text-black',
    })
  }

  const toastSweetInfo = (message: string) => {
    toastSweet.fire({
      icon: 'info',
      title: message,
      iconColor: 'info',
      background: cookieRef('tema_color').value === 'dark' ? '#25293C' : '#fff',
      customClass: cookieRef('tema_color').value === 'dark' ? 'text-white' : 'text-black',
    })
  }

  const preguntaEliminar = async (titulo: string, message?: string) => {
    return await Swal.fire({
      title: titulo ?? '¿Estás seguro?',
      text: message ?? 'No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      background: cookieRef('tema_color').value === 'dark' ? '#25293C' : '#fff',
      customClass: cookieRef('tema_color').value === 'dark' ? 'text-white' : 'text-black',
    }).then(result => {
      return result.isConfirmed
    })

    return false
  }

  const realizarPregunta = async ({
                                    titulo = '¿Estás seguro?',
                                    message = 'No podrás revertir esto!',
                                    texto_btn_confirmar = 'Sí, eliminar',
                                    texto_btn_cancelar = 'Cancelar',
                                    color_confirmar = '#d33',
                                    color_cancelar = '#3085d6',
                                    icono = 'warning',
                                    color_texto_confirmar = '#ffffff',
                                    color_texto_cancelar = '#ffffff',
                                    input = null, // 'text' | 'textarea' | null
                                    inputPlaceholder = '',
                                    inputMinLength = 0, // mínimo requerido, por defecto 0
                                  }: {
    titulo?: string
    message?: string
    texto_btn_confirmar?: string
    texto_btn_cancelar?: string
    color_texto_confirmar?: string
    color_texto_cancelar?: string
    color_confirmar?: string
    color_cancelar?: string
    icono?: 'warning' | 'error' | 'success' | 'info'
    input?: 'text' | 'textarea' | null
    inputPlaceholder?: string
    inputMinLength?: number
  }) => {
    const temaColor = cookieRef('tema_color').value === 'dark' ? '#25293C' : '#fff'
    const isDarkMode = cookieRef('tema_color').value === 'dark' ? 'text-white' : 'text-black'

    const result = await Swal.fire({
      title: titulo,
      html: message,
      icon: icono,
      showCancelButton: true,
      confirmButtonText: `<span style="color: ${color_texto_confirmar};">${texto_btn_confirmar}</span>`,
      cancelButtonText: `<span style="color: ${color_texto_cancelar};">${texto_btn_cancelar}</span>`,
      confirmButtonColor: color_confirmar,
      cancelButtonColor: color_cancelar,
      background: temaColor,
      customClass: isDarkMode,
      input,
      inputPlaceholder,
      inputValidator: value => {
        if (input && inputMinLength > 0 && (!value || value.length < inputMinLength))
          return `Debe tener al menos ${inputMinLength} caracteres`

        return null
      },
    })

    if (input)
      return { confirmado: result.isConfirmed, comentario: result.value || null }
    else
      return result.isConfirmed
  }

  return {
    showToastSuccess,
    showToastError,
    showToastWarning,
    showToastInfo,
    showToasMensajeNotificacion,
    preguntaEliminar,
    realizarPregunta,
    toastSweetSuccess,
    toastSweetError,
    toastSweetWarning,
    toastSweetInfo,
  }
}

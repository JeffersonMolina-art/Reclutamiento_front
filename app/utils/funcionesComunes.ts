import { format } from 'date-fns'
import { PROGRAMADOR_TEXT } from '@/constantes/admin/modulo-usuarios/Const-Roles'
import type { UsuarioInterface } from '@/types/usuarios'

/**
 * Función que calcula la diferencia entre dos fechas y retorna un string con la diferencia
 * @param fechaRegistro
 */
export const haceCuantoFueHecha = (fechaRegistro: Date | string): string => {
  // Convertir a Date si es un string
  const fecha: Date
    = fechaRegistro instanceof Date ? fechaRegistro : new Date(fechaRegistro)

  // Verificar si la fecha es válida
  if (isNaN(fecha.getTime()))
    return 'Fecha inválida'

  const ahora: Date = new Date()
  const diferenciaMs: number = ahora.getTime() - fecha.getTime()

  // Constantes para convertir milisegundos
  const segundoMs = 1000
  const minutoMs = segundoMs * 60
  const horaMs = minutoMs * 60
  const diaMs = horaMs * 24
  const mesMs = diaMs * 30 // Aproximación
  const anioMs = mesMs * 12 // Aproximación

  // Cálculo de cada unidad de tiempo
  const años = Math.floor(diferenciaMs / anioMs)
  const restoAnio = diferenciaMs % anioMs

  const meses = Math.floor(restoAnio / mesMs)
  const restoMes = restoAnio % mesMs

  const dias = Math.floor(restoMes / diaMs)
  const restoDia = restoMes % diaMs

  const horas = Math.floor(restoDia / horaMs)
  const restoHora = restoDia % horaMs

  const minutos = Math.floor(restoHora / minutoMs)
  const restoMinuto = restoHora % minutoMs

  const segundos = Math.floor(restoMinuto / segundoMs)

  // Armamos un arreglo con las partes no nulas
  const partes: string[] = []
  if (años > 0)
    partes.push(`${años} año${años > 1 ? 's' : ''}`)

  if (meses > 0)
    partes.push(`${meses} mes${meses > 1 ? 'es' : ''}`)

  if (dias > 0)
    partes.push(`${dias} día${dias > 1 ? 's' : ''}`)

  if (horas > 0)
    partes.push(`${horas} hora${horas > 1 ? 's' : ''}`)

  if (minutos > 0)
    partes.push(`${minutos} minuto${minutos > 1 ? 's' : ''}`)

  if (segundos > 0)
    partes.push(`${segundos} segundo${segundos > 1 ? 's' : ''}`)

  // Si no hay diferencia, retornamos 0 segundos
  if (partes.length === 0)
    return '0 segundos'

  // Devolvemos las dos unidades más grandes para mayor precisión
  return partes.slice(0, 2).join(', ')
}
export const entornoActual = (): string => {
  const config = useRuntimeConfig()
  return config.public.entorno
}

/**
 * Función que formatea un número a moneda
 * @param value
 */
export function formatoDinero(value: number): string {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function manejaError(error: any): void {
  const { showToastError } = useToast()
  const usuarioAutenticado = useSanctumUser<UsuarioInterface>()

  const esDeveloper = usuarioAutenticado.value?.roles.some(
    rol => rol?.toLowerCase() === PROGRAMADOR_TEXT.toLowerCase(),
  )

  const codigoEstado = error?.response?.status

  console.error('Error de la peticion de la base de datos:', error.message)

  if (error.response && error.response.data instanceof Blob) {
    // 1. Convertimos el Blob a texto
    const reader = new FileReader()

    reader.onload = () => {
      const responseData = JSON.parse(reader.result)

      showToastError(responseData.message)
    }
    reader.readAsText(error.response.data)
  }
  else {
    if (codigoEstado && codigoEstado < 500) {
      showToastError(error?.response?.data?.message || 'Error desconocido')
    }
    else if ((codigoEstado && codigoEstado >= 500) || !codigoEstado) {
      // Si el código de estado es mayor o igual a 500 o no tiene código de estado, solo los desarrolladores verán los detalles
      if (esDeveloper) {
        console.error('Error:', error) // Mostrar detalles del error solo a los desarrolladores
        showToastError(error?.response?.data?.message || 'Error desconocido')
      }
      else {
        showToastError(
          'Ha ocurrido un error interno. Por favor, contacta al administrador.',
        )
      }
    }
  }
}

/**
 * Función que verifica si una variable tiene datos
 * @param variable
 */
export function tieneDatos(variable: any): boolean {
  if (variable === null || variable === undefined)
    return false

  if (typeof variable === 'string')
    return variable.trim() !== ''

  if (Array.isArray(variable)) {
    const filtrado = variable.filter(v => tieneDatos(v))

    return filtrado.length > 0
  }

  if (typeof variable === 'object') {
    const keys = Object.keys(variable)
    if (keys.length === 0)
      return false

    return keys.some(key => tieneDatos(variable[key]))
  }

  return true
}

/**
 * Función que formatea la fecha para un input
 * @param fecha
 */
export function formatearFechaInput(fecha: Date | string): string {
  if (!fecha)
    return ''
  if (fecha instanceof Date)
    return fecha.toISOString().split('T')[0]

  return fecha.split('T')[0]
}

/**
 * Función para formater fecha para la vista dd-mm-yyyy
 * @param str
 */
export function formatearFecha(fecha: string | Date): string {
  return format(new Date(fecha), 'dd-MM-yyyy')
}

/**
 * Funcion para mostrar la fecha con los minutos y segundos
 * @param error
 */
export function formatoFechaHora(fecha: string | Date): string {
  return format(new Date(fecha), 'dd-MM-yyyy HH:mm:ss')
}

export const mostrarError = async (error: any): Promise<void> => {
  const { showToastError } = useToast()

  const response = error?.response

  if (!response) {
    showToastError('Error inesperado')

    return
  }

  const status = response.status as number
  let mensajeError = ''

  /* ───────── 404 ───────── */
  if (status === 404) {
    mensajeError
      = response.data?.message ?? 'Recurso no encontrado en el servidor'
    showToastError(mensajeError)

    return
  }

  /* ───────── 422 ───────── */
  if (status === 422) {
    const bag = response.data?.errors ?? null // formato “correcto”

    if (bag && typeof bag === 'object') {
      const mensajes: string[] = Object.values(bag).flat() as string[]

      mensajes.forEach(showToastError)
    }

    return
  }

  /* ───────── 403 ───────── */
  if (status === 403) {
    mensajeError
      = response.data?.message ?? 'No tienes permiso para realizar esta acción'
    showToastError(mensajeError)
    await navigateTo({
      path: '/',
      replace: true,
    })

    return
  }

  mensajeError = response.data?.message ?? 'Error en la respuesta del servidor'
  showToastError(mensajeError)
}

export const separarFechas = (fechaUnificada: string): string[] => {
  return fechaUnificada.split(/\s+a\s+|\s+to\s+/).map(fecha => fecha.trim())
}

export const formatoNumerico = (
  valor: number | string | null | undefined,
): string => {
  if (
    valor === null
    || valor === undefined
    || valor === ''
  ) {
    return '';
  }

  const valorLimpio = String(valor)
    .replace(/,/g, '')
    .replace('Q', '')
    .trim()

  const numero = Number(valorLimpio)

  if (!Number.isFinite(numero))
    return 'Q 0.00'

  return `Q ${numero.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Compara de forma inteligente dos valores de cualquier tipo
 * (números, textos, booleanos, nulos, arreglos u objetos) de manera
 * agnóstica al orden y al tipo estricto en el caso de números/strings.
 *
 * @param valor1 Primer valor a comparar
 * @param valor2 Segundo valor a comparar
 * @returns boolean Devuelve true si son lógicamente idénticos
 */
export const sonValoresIguales = (valor1: any, valor2: any): boolean => {
  if (!tieneDatos(valor1))
    valor1 = ''
  if (!tieneDatos(valor2))
    valor2 = ''

  if (typeof valor1 === 'number' || typeof valor2 === 'number')
    return String(valor1) === String(valor2)

  if (Array.isArray(valor1) && Array.isArray(valor2)) {
    if (valor1.length !== valor2.length)
      return false

    const arr1Ordenado = [...valor1].map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).sort()
    const arr2Ordenado = [...valor2].map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).sort()

    return JSON.stringify(arr1Ordenado) === JSON.stringify(arr2Ordenado)
  }

  if (typeof valor1 === 'object' && typeof valor2 === 'object') {
    const keys1 = Object.keys(valor1)
    const keys2 = Object.keys(valor2)

    if (keys1.length !== keys2.length)
      return false

    return keys1.every(key => {
      if (!Object.prototype.hasOwnProperty.call(valor2, key))
        return false

      return sonValoresIguales(valor1[key], valor2[key])
    })
  }

  return String(valor1) === String(valor2)
}

export function primeraLetraMayuscula(valor?: string | null): string {
  if (!valor) return "";

  return valor
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

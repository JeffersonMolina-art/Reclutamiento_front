import { db } from '../../utils/offline/guayCreditDb'

export const useDatosOffline = () => {
  const guardarDato = async (clave: string, data: any) => {
    try {
      await db.datos.put({
        id: clave,
        clave,
        data,
        timestamp: Date.now(),
      })
    }
    catch (error) {
      console.error(`Error al guardar el dato con clave "${clave}":`, error)
    }
  }

  const obtenerDato = async <T = any>(clave: string): Promise<T | null> => {
    try {
      const registro = await db.datos.where('clave').equals(clave).first()

      return registro ? (registro.data as T) : null
    }
    catch (error) {
      console.error(`Error al obtener el dato con clave "${clave}":`, error)

      return null
    }
  }

  return {
    guardarDato,
    obtenerDato,
  }
}

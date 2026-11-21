import { db } from '../../utils/offline/guayCreditDb'

// Estructura dinámica para cualquier petición HTTP
export interface PeticionOffline {
  id: string
  url: string // La ruta exacta a donde iba la petición (ej. 'api/solicitudes/guardar')
  metodo: string // 'POST', 'PUT', 'DELETE', etc.
  payload?: any // El body de la petición
  prioridad: number
  timestamp: number
}

export const useColaOffline = () => {
  // Nombres limpios: agregar, obtenerPendientes, eliminar
  const agregar = async (url: string, metodo: string, payload: any = null) => {
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    // Buscamos la petición con la prioridad más alta usando el índice de Dexie
    const ultimoRegistro = await db.pendientes.orderBy('prioridad').last()

    // Si hay registros, le sumamos 1 al mayor. Si está vacía, empieza en 1.
    const nuevaPrioridad = ultimoRegistro ? ultimoRegistro.prioridad + 1 : 1

    const peticion: PeticionOffline = {
      id,
      url,
      metodo: metodo.toUpperCase(),
      payload,
      prioridad: nuevaPrioridad,
      timestamp: Date.now(),
    }

    await db.pendientes.put(peticion)

    return peticion
  }

  const obtenerPendientes = async (): Promise<PeticionOffline[]> => {
    const items = await db.pendientes.toArray()

    return items.sort((a, b) => {
      if (a.prioridad !== b.prioridad)
        return a.prioridad - b.prioridad

      return a.timestamp - b.timestamp
    })
  }

  const eliminar = async (id: string) => {
    await db.pendientes.delete(id)
  }

  return {
    agregar,
    obtenerPendientes,
    eliminar,
  }
}

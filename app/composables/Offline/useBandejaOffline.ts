import { db } from '../../utils/offline/guayCreditDb'

export const useBandejaOffline = () => {
  const guardarBandeja = async (datos: any[], tipoBandeja: string = 'general') => {
    if (!Array.isArray(datos))
      throw new TypeError('El argumento "datos" debe ser un arreglo.')

    try {
      const nuevosRegistros = datos.map(item => ({
        id: Number(item.id || item.codigo),
        tipo_bandeja: tipoBandeja,
        ...item,
      }))

      // Usamos bulkPut directamente: inserta los nuevos y actualiza los existentes
      // sin tocar los registros de otras páginas o de otras bandejas.
      await db.bandejas.bulkPut(nuevosRegistros)

      console.log(`✅ Bandeja "${tipoBandeja}" actualizada acumulativamente en Dexie.js`)
    }
    catch (error) {
      console.error('🔥 Error al respaldar la bandeja:', error)
      throw error
    }
  }

  const obtenerBandeja = async (tipoBandeja?: string) => {
    try {
      const items = tipoBandeja
        ? await db.bandejas.where('tipo_bandeja').equals(tipoBandeja).toArray()
        : await db.bandejas.toArray()

      return {
        items,
        total: items.length,
      }
    }
    catch (error) {
      console.error('🔥 Error al obtener la bandeja:', error)

      return {
        items: [],
        total: 0,
      }
    }
  }

  const limpiarBandeja = async (tipoBandeja?: string) => {
    try {
      if (tipoBandeja)
        await db.bandejas.where('tipo_bandeja').equals(tipoBandeja).delete()
      else
        await db.bandejas.clear()
    }
    catch (error) {
      console.error('🔥 Error al limpiar la bandeja:', error)
      throw error
    }
  }

  const eliminarItem = async (id: number) => {
    try {
      await db.bandejas.delete(Number(id))
      console.log(`🗑️ Ítem con ID ${id} eliminado de la bandeja local.`)
    }
    catch (error) {
      console.error(`🔥 Error al eliminar el ítem ${id} de la bandeja:`, error)
      throw error
    }
  }

  return {
    guardarBandeja,
    obtenerBandeja,
    limpiarBandeja,
    eliminarItem,
  }
}

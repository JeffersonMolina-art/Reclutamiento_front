import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface PeticionPendiente {
  id: string
  url: string
  metodo: string
  payload?: any
  prioridad: number
  timestamp: number
}

export interface DatoOffline {
  id: string
  clave: string
  data: any
  timestamp: number
}

export interface BandejaItem {
  id: number
  tipo_bandeja: string
  [key: string]: any
}

class GuayCreditDb extends Dexie {
  pendientes!: Table<PeticionPendiente, string>
  datos!: Table<DatoOffline, string>
  bandejas!: Table<BandejaItem, number>

  constructor() {
    super('guayCreditDb')
    this.version(1).stores({
      pendientes: 'id, prioridad, timestamp',
      datos: 'id, clave',
      bandejas: 'id, tipo_bandeja',
    })
  }
}

export const db = new GuayCreditDb()

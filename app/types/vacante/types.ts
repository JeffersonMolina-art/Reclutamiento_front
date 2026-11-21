export interface VacanteInterface {
  estado_id: number
  puesto_id: number
  sede_id: number
  nombre: string
  descripcion: string
  cantidad_plazas: number
  user_id: number
  fecha_publicacion: string
  user_encargado: number
  modalidad_trabajo: string
  salario_minimo: number
  salario_maximo: number
  requisitos?: VacanteRequisitoInterface[]
  caracteristicas?: VacanteCaracteristicaInterface[]
}
export interface VacanteRequisitoInterface {
  id?: number
  nombre: string
  es_obligatorio: boolean
}

export interface VacanteCaracteristicaInterface {
  id?: number
  nombre: string
  valor: string
}

export interface VacantePublicaInterface {
  id: number
  nombre: string
  descripcion: string
  puesto?: string | null
  sede?: string | null
  cantidad_plazas?: string | null
  modalidad_trabajo?: string | null
  salario_minimo?: string | null
  salario_maximo?: string | null
  fecha_publicacion?: string | null
  caracteristicas?: { nombre: string, valor: string }[]
  requisitos?: { nombre: string, es_obligatorio: boolean }[]
}

export interface CandidatoExternoInterface {
  nombres: string
  apellidos: string
  dpi: string
  email: string
  telefono: string
  fecha_nacimiento: string | null
  password: string
  password_confirmation: string
  acepta_terminos: boolean
}

export interface RespuestaVacantesPublicas {
  data: VacantePublicaInterface[]
  meta?: { total: number, current_page: number, last_page: number }
}

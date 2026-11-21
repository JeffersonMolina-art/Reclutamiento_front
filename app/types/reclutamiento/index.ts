export interface VacantePublicaInterface {
  id: number
  titulo: string
  descripcion: string
  departamento?: string | null
  agencia?: string | null
  tipo_contrato?: string | null
  fecha_publicacion?: string | null
  fecha_cierre?: string | null
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

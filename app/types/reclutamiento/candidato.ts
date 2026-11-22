export interface PostulacionResumen {
  id: number
  vacante_id: number
  vacante: string
  estado: string
  estado_codigo: string
  fecha_postulacion: string
}

export interface CandidatoListado {
  id: number
  nombre_completo: string
  dpi?: string | null
  correo?: string | null
  telefono?: string | null
  expectativa_salarial?: number | string | null
  total_postulaciones: number
  postulaciones: PostulacionResumen[]
}

export interface SeguimientoPostulacion {
  estado: string
  estado_codigo: string
  porcentaje?: number | null
  comentario?: string | null
  usuario?: string | null
  fecha: string
}

export interface PostulacionHistorial {
  id: number
  vacante: string
  puesto?: string | null
  sede?: string | null
  estado: string
  estado_codigo: string
  fecha_postulacion: string
  porcentaje?: number | null
  seguimiento: SeguimientoPostulacion[]
}

export interface HistorialCandidato {
  candidato: Pick<CandidatoListado, 'id' | 'nombre_completo' | 'dpi' | 'correo' | 'telefono'>
  postulaciones: PostulacionHistorial[]
}

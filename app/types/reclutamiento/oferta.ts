export interface EvaluacionExamen {
  puntuacion: number
  modalidad: string
  fecha_evaluacion?: string | null
  comentarios?: string | null
}

export interface ArchivoExamen {
  id: number
  nombre: string
  extension?: string | null
  tamano?: number | string | null
  original_url: string
  evaluacion?: EvaluacionExamen | null
}

export interface EntrevistaRealizada {
  id: number
  tipo_entrevista: string
  modalidad: string
  fecha_hora_programada: string
  ubicacion_o_enlace?: string | null
  observaciones?: string | null
  resultado: string
  entrevistador?: { nombre_completo?: string | null } | null
}

export interface VacanteDetalle {
  nombre?: string | null
  salario_minimo?: number | string | null
  salario_maximo?: number | string | null
  puesto?: { nombre: string } | null
  sede?: { nombre: string } | null
  requisitos?: { id: number; nombre: string; es_obligatorio: boolean }[]
}

export interface CandidatoDetalle {
  primer_nombre?: string | null
  segundo_nombre?: string | null
  tercer_nombre?: string | null
  primer_apellido?: string | null
  segundo_apellido?: string | null
  dpi?: string | null
  correo_contacto?: string | null
  telefono_contacto?: string | null
  expectativa_salarial?: number | string | null
  conocimientos?: { id: number; descripcion: string; nivel?: string | null }[]
  experiencias?: { id: number; empresa: string; puesto: string; fecha_inicio?: string | null; fecha_fin?: string | null }[]
  formaciones?: { id: number; nombre: string; titulo_carrera?: string | null }[]
}

export interface PostulacionDetalle {
  id: number
  fecha_postulacion?: string | null
  estado?: { id: number; nombre: string; codigo: string } | null
  vacante?: VacanteDetalle | null
  candidato?: CandidatoDetalle | null
  examenes?: Record<string, ArchivoExamen[]>
  entrevistas?: EntrevistaRealizada[]
}

export interface OfertaEnviada {
  salario_ofrecido: number | string
  fecha_inicio_propuesta: string
  condiciones_oferta: string
  estado_oferta: 'pendiente' | 'aceptada' | 'rechazada'
  fecha_respuesta_oferta?: string | null
  motivo_rechazo_oferta?: string | null
}

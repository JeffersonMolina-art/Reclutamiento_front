export interface Entrevista {
  id: number
  fecha_hora_programada: string
  modalidad: 'presencial' | 'virtual'
  ubicacion_o_enlace: string
  tipo_entrevista: string
  observaciones?: string | null
  resultado?: 'pendiente' | 'aprobado' | 'no_aprobado' | null
  entrevistador?: { nombre_completo?: string | null } | null
  estado?: { nombre: string } | null
}

export interface ContactoCandidato {
  nombre: string
  correo?: string | null
  telefono?: string | null
}

export interface EstadoDisponible {
  id: number
  codigo: string
  nombre: string
}

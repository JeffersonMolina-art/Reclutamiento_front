export const TIPOS_ENTREVISTA = [
  { title: 'Técnica', value: 'tecnica' },
  { title: 'Recursos humanos', value: 'recursos_humanos' },
]

export const MODALIDADES_ENTREVISTA = [
  { title: 'Presencial', value: 'presencial' },
  { title: 'Virtual', value: 'virtual' },
]

export const RESULTADOS_ENTREVISTA: Record<string, { texto: string; color: string }> = {
  pendiente: { texto: 'Pendiente', color: 'warning' },
  aprobado: { texto: 'Aprobado', color: 'success' },
  no_aprobado: { texto: 'No aprobado', color: 'error' },
}

export const REGEX_MEET = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:\?\S*)?$/i

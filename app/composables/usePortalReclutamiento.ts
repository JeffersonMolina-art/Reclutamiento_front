import type {
  CandidatoExternoInterface,
  RespuestaVacantesPublicas,
} from '@/types/reclutamiento'

export const usePortalReclutamiento = () => {
  const { get, post } = useClienteRequest()

  const obtenerVacantes = (params: { page?: number, buscar?: string } = {}) => {
    const query = new URLSearchParams()

    if (params.page)
      query.set('page', String(params.page))
    if (params.buscar)
      query.set('buscar', params.buscar)

    return get<RespuestaVacantesPublicas>(`/api/publico/vacantes?${query.toString()}`)
  }

  const registrarCandidato = (datos: CandidatoExternoInterface) =>
    post<{ message: string }>('/api/publico/candidatos/registro', datos)

  return { obtenerVacantes, registrarCandidato }
}

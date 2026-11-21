export interface PerfilCandidatoInterface {
  id: number
  email: string
  telefono: string | null
  nombres: string | null
  apellidos: string | null
  email_verificado: boolean
}

export interface PostulacionCandidatoInterface {
  id: number
  vacante_id: number
  vacante: string | null
  puesto: string | null
  sede: string | null
  modalidad_trabajo: string | null
  estado: string | null
  estado_codigo: string | null
  fecha_postulacion: string | null
}

interface RespuestaLoginCandidato {
  token: string
  token_type: string
  expires_at: string
  candidato: PerfilCandidatoInterface
}

const OCHO_HORAS = 60 * 60 * 8

// Sesión exclusiva de candidatos: usa su propia cookie para no mezclarse con la de usuarios internos
export const useCandidatoSesion = () => {
  const token = useCookie<string | null>('candidato.token', {
    maxAge: OCHO_HORAS,
    sameSite: 'lax',
    secure: import.meta.client ? window.location.protocol === 'https:' : false,
  })

  const perfil = useState<PerfilCandidatoInterface | null>('candidato.perfil', () => null)

  const deviceId = useCookie('x-device-id', {
    maxAge: 60 * 60 * 24 * 365,
    default: () => generateUUID(),
  })

  const estaAutenticado = computed(() => !!token.value)

  const peticion = <T>(url: string, opciones: Record<string, any> = {}) =>
    $fetch<T>(url, {
      baseURL: '/services',
      ...opciones,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Device-Id': deviceId.value,
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
    })

  const login = async (email: string, password: string) => {
    const respuesta = await peticion<RespuestaLoginCandidato>('/api/publico/candidatos/login', {
      method: 'POST',
      body: { email, password },
    })

    token.value = respuesta.token
    perfil.value = respuesta.candidato

    return respuesta
  }

  const cargarPerfil = async () => {
    if (!token.value)
      return null

    try {
      perfil.value = await peticion<PerfilCandidatoInterface>('/api/portal/me')
    }
    catch {
      token.value = null
      perfil.value = null
    }

    return perfil.value
  }

  const postulaciones = useState<PostulacionCandidatoInterface[]>('candidato.postulaciones', () => [])

  const idsPostulados = computed(() => new Set(postulaciones.value.map(p => p.vacante_id)))

  const cargarPostulaciones = async () => {
    if (!token.value) {
      postulaciones.value = []

      return
    }

    const respuesta = await peticion<{ data: PostulacionCandidatoInterface[] }>('/api/portal/postulaciones')

    postulaciones.value = respuesta.data
  }

  const postular = async (vacanteId: number) => {
    const respuesta = await peticion<{ message: string }>('/api/portal/postulaciones', {
      method: 'POST',
      body: { vacante_id: vacanteId },
    })

    await cargarPostulaciones()

    return respuesta
  }

  const logout = async () => {
    try {
      if (token.value)
        await peticion('/api/portal/logout', { method: 'POST' })
    }
    finally {
      token.value = null
      perfil.value = null
      postulaciones.value = []
    }
  }

  return {
    peticion,
    token,
    perfil,
    estaAutenticado,
    postulaciones,
    idsPostulados,
    login,
    cargarPerfil,
    cargarPostulaciones,
    postular,
    logout,
  }
}

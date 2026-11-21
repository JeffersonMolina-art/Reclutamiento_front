export interface PerfilCandidatoInterface {
  id: number
  email: string
  telefono: string | null
  nombres: string | null
  apellidos: string | null
  email_verificado: boolean
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

  const logout = async () => {
    try {
      if (token.value)
        await peticion('/api/portal/logout', { method: 'POST' })
    }
    finally {
      token.value = null
      perfil.value = null
    }
  }

  return { token, perfil, estaAutenticado, login, cargarPerfil, logout }
}

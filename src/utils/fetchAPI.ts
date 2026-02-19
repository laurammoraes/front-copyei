export const TOKEN_KEY = 'copyei_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token || token === 'undefined' || token === 'null') return null
  return token
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export function getProxyHeaders(): Record<string, string> {
  const token = getAuthToken()
  if (!token) return {}
  return { 'X-Auth-Token': token }
}

const toProxyPath = (url: RequestInfo | URL) =>
  (typeof url === 'string' ? url : String(url)).replace(/^\//, '')

export async function fetchAPI<T = unknown>(url: RequestInfo | URL, init?: RequestInit) {
  try {
    const path = toProxyPath(url)
    const headers = new Headers(init?.headers)
    const token = getAuthToken()
    if (token) headers.set('X-Auth-Token', token)
    const response = await fetch(`/api/proxy/${path}`, {
      ...init,
      credentials: 'include',
      headers,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const text = await response.text()

    if (!text.trim()) {
      return {
        data: null as T,
        status: response.status,
        ok: response.ok,
        headers: response.headers,
      }
    }

    if (!isJson) {
      console.warn('[fetchAPI] Resposta não é JSON', { path, contentType, status: response.status })
      return {
        data: null as T,
        status: response.status,
        ok: false,
        headers: response.headers,
      }
    }

    try {
      const data = JSON.parse(text) as T
      return {
        data,
        status: response.status,
        ok: response.ok,
        headers: response.headers,
      }
    } catch (parseError) {
      console.warn('[fetchAPI] JSON inválido', { path, status: response.status }, parseError)
      return {
        data: null as T,
        status: response.status,
        ok: false,
        headers: response.headers,
      }
    }
  } catch (error) {
    console.error(error)
    return {
      data: null as T,
      status: 500,
      ok: false,
      headers: new Headers(),
      error,
    }
  }
}

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

    const data = (await response.json()) as T

    return {
      data,
      status: response.status,
      ok: response.ok,
      headers: response.headers,
    }
  } catch (error) {
    console.error(error)

    return { data: null, status: 500, ok: false, headers: {}, error }
  }
}

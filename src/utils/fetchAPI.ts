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

const toProxyPath = (url: RequestInfo | URL) =>
  (typeof url === 'string' ? url : String(url)).replace(/^\//, '')

export async function fetchAPI<T = unknown>(url: RequestInfo | URL, init?: RequestInit) {
  try {
    const path = toProxyPath(url)
    const response = await fetch(`/api/proxy/${path}`, {
      ...init,
      credentials: 'include',
      headers: init?.headers ?? {},
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

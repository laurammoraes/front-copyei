export const TOKEN_KEY = 'copyei_token'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function fetchAPI<T = unknown>(url: RequestInfo | URL, init?: RequestInit) {
  try {
    const authHeaders = getAuthHeaders()
    const headers = new Headers(init?.headers)
    if (authHeaders.Authorization && !headers.has('Authorization')) {
      headers.set('Authorization', authHeaders.Authorization)
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
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

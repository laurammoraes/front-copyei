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

function buildHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers)
  const token = getAuthToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else if (headers.has('Authorization')) {
    headers.delete('Authorization')
  }
  return headers
}

export async function fetchAPI<T = unknown>(url: RequestInfo | URL, init?: RequestInit) {
  try {
    const headers = buildHeaders(init)

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

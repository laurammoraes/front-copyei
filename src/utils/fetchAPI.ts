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

async function fetchOnce<T>(
  path: string,
  init: RequestInit,
  headers: Headers
): Promise<{ response: Response; text: string }> {
  const response = await fetch(`/api/proxy/${path}`, {
    ...init,
    credentials: 'include',
    headers,
    cache: (init.method ?? 'GET') === 'GET' ? 'no-store' : init.cache,
  })
  const text = await response.text()
  return { response, text }
}

export async function fetchAPI<T = unknown>(url: RequestInfo | URL, init?: RequestInit) {
  console.log('>>> [fetchAPI] INICIOU CHAMADA PARA:', url)
  try {
    const path = toProxyPath(url)
    const headers = new Headers(init?.headers)
    const token = getAuthToken()
    if (token) headers.set('X-Auth-Token', token)

<<<<<<< HEAD
    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const text = await response.text()
=======
    let { response, text } = await fetchOnce(path, init ?? {}, headers)
    console.log(`[DEBUG] Path: ${path} | Status: ${response.status} | Body Length: ${text.length}`)

    /* Retry uma vez em GET quando a resposta for 200 mas corpo vazio (comportamento instável do backend) */
    const method = (init?.method ?? 'GET').toUpperCase()
    if (method === 'GET' && response.ok && !text.trim()) {
      await new Promise((r) => setTimeout(r, 400))
      const next = await fetchOnce(path, init ?? {}, headers)
      if (next.text.trim()) {
        response = next.response
        text = next.text
      }
    }
>>>>>>> d9d0d2f (requisição funcionando)

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

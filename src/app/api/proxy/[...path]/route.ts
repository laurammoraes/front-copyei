import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL

/** Extrai o nome do site do editor a partir do Referer (ex: .../api/proxy/editor/testelaura3 -> testelaura3) */
function getEditorSiteNameFromReferer(referer: string | null): string | null {
  if (!referer) return null
  try {
    const u = new URL(referer)
    const match = u.pathname.match(/\/editor\/([^/]+)\/?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

/** Verifica se o segmento parece um asset (arquivo) e não um nome de site (ex: index.js, main.css) */
function looksLikeEditorAsset(segment: string): boolean {
  return segment.includes('.') || /\.(js|css|map|ico|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/i.test(segment)
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  if (!API_BASE_URL) {
    return NextResponse.json({ message: 'API not configured' }, { status: 500 })
  }

  let segments = [...pathSegments]
  /* Editor: requisições para editor/asset ou editor/static/... sem nome do site → usar Referer para editor/siteName/... */
  if (
    segments[0] === 'editor' &&
    segments.length >= 2 &&
    (looksLikeEditorAsset(segments[1]) || segments[1] === 'static' || segments[1] === 'editor-scripts')
  ) {
    const siteName = getEditorSiteNameFromReferer(request.headers.get('referer'))
    if (siteName) {
      segments = ['editor', siteName, ...segments.slice(1)]
    }
  }

  const path = segments.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${path}${searchParams ? `?${searchParams}` : ''}`

  const cookieStore = await cookies()
  const token =
    cookieStore.get('copyei_user')?.value ??
    request.headers.get('x-auth-token')?.trim()

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('x-auth-token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else if (headers.has('Authorization')) {
    headers.delete('Authorization')
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      init.body = await request.text()
    } else if (contentType?.includes('multipart/form-data')) {
      init.body = await request.formData()
      headers.delete('content-type')
    } else {
      init.body = await request.blob()
    }
  }

  let response = await fetch(url, init)

  /* Para o path editor: seguir redirects no servidor (evita 401 no browser ao redirecionar para a API) */
  if (segments[0] === 'editor' && response.status >= 300 && response.status < 400) {
    let nextUrl: string | null = response.headers.get('location')
    const baseUrl = API_BASE_URL.replace(/\/$/, '')
    const followInit: RequestInit = { method: 'GET', headers, redirect: 'manual' }
    while (nextUrl) {
      let resolvedUrl: string
      if (nextUrl.startsWith('http')) {
        resolvedUrl = nextUrl
      } else {
        let path = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`
        if (baseUrl.endsWith('/api') && path.startsWith('/api/')) path = path.slice(4)
        resolvedUrl = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
      }
      response = await fetch(resolvedUrl, followInit)
      nextUrl =
        response.status >= 300 && response.status < 400 ? response.headers.get('location') : null
    }
  } else if (segments[0] === 'site' && response.status >= 300 && response.status < 400) {
    /* Para site/*: seguir redirects no servidor (backend renderiza o site e pode redirecionar com URL relativa) */
    let nextUrl: string | null = response.headers.get('location')
    const baseUrl = API_BASE_URL.replace(/\/$/, '')
    while (nextUrl) {
      let resolved: string
      if (nextUrl.startsWith('http')) {
        resolved = nextUrl
      } else {
        let path = nextUrl.startsWith('/') ? nextUrl : `/${nextUrl}`
        if (baseUrl.endsWith('/api') && path.startsWith('/api/')) path = path.slice(4)
        resolved = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
      }
      response = await fetch(resolved, { method: 'GET', headers, redirect: 'manual' })
      nextUrl = response.status >= 300 && response.status < 400 ? response.headers.get('location') : null
    }
  } else if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location')
    if (location) {
      try {
        const apiBase = API_BASE_URL.replace(/\/$/, '')
        let path = location.startsWith('/') ? location : `/${location}`
        if (apiBase.endsWith('/api') && path.startsWith('/api/')) {
          path = path.slice(4)
        }
        const absoluteUrl = `${apiBase}${path}`
        new URL(absoluteUrl)
        return NextResponse.redirect(absoluteUrl)
      } catch {
        /* URL inválida; não redireciona para evitar TypeError: Invalid URL */
      }
    }
  }

  const contentType = response.headers.get('content-type') ?? ''
  const resHeaders = new Headers()
  response.headers.forEach((v, k) => {
    if (!['content-encoding', 'transfer-encoding'].includes(k.toLowerCase())) {
      resHeaders.set(k, v)
    }
  })

  const status = response.status === 304 ? 200 : response.status

  if (contentType.includes('application/json')) {
    const text = await response.text()
    let data: unknown
    if (!text.trim()) {
      data = {}
    } else {
      try {
        data = JSON.parse(text)
      } catch {
        data = {}
      }
    }
    return NextResponse.json(data, { status, headers: resHeaders })
  }
  if (contentType.includes('application/') || contentType.includes('text/')) {
    let text = await response.text()
    /* Reescreve URLs absolutas da API no HTML do editor para passarem pelo proxy (evita 401 em scripts/assets) */
    const isEditorPage =
      segments[0] === 'editor' &&
      (segments.length === 2 || (segments.length === 3 && !segments[2])) &&
      segments[1] !== 'static' &&
      segments[1] !== 'editor-scripts' &&
      !looksLikeEditorAsset(segments[1])
    if (isEditorPage && contentType.includes('text/html')) {
      const apiBase = API_BASE_URL.replace(/\/$/, '')
      const proxyBase = `${new URL(request.url).origin}/api/proxy`
      text = text.replaceAll(apiBase, proxyBase)
    }
    return new NextResponse(text, { status, headers: resHeaders })
  }
  const blob = await response.blob()
  return new NextResponse(blob, { status, headers: resHeaders })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}

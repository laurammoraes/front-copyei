import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type LoginResponse = {
  message?: string
  token?: string
  accessToken?: string
  access_token?: string
}

function getApiBaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL
  )
}

export async function POST(request: NextRequest) {
  try {
    const API_BASE_URL = getApiBaseUrl()
    if (!API_BASE_URL) {
      return NextResponse.json(
        {
          message: 'API URL not configured',
          hint: 'Set NEXT_PUBLIC_API_BASE_URL or API_BASE_URL in .env',
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Invalid Credentials' },
        { status: 400 }
      )
    }

    // Faz a requisição de login para o backend
    const loginUrl = `${API_BASE_URL.replace(/\/$/, '')}/login`
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      redirect: 'manual',
    })

    let data: LoginResponse | null = null
    try {
      const text = await response.text()
      if (text) {
        data = JSON.parse(text) as LoginResponse
      }
    } catch {
      console.error('Login: backend returned non-JSON response')
      return NextResponse.json(
        {
          message: 'Backend returned invalid response',
          reason: 'BACKEND_NON_JSON',
          url: loginUrl,
        },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(data ?? { message: 'Request failed' }, { status: response.status })
    }

    if (data?.message === 'Invalid Credentials') {
      return NextResponse.json(data, { status: 401 })
    }

    // Extrai o token do cookie Set-Cookie da resposta do backend
    let token: string | undefined

    const setCookieHeaders = response.headers.getSetCookie?.() ?? [
      response.headers.get('set-cookie') ?? '',
    ].filter(Boolean)
    for (const header of setCookieHeaders) {
      const match = header.match(/copyei_user=([^;]+)/)
      if (match) {
        try {
          token = decodeURIComponent(match[1])
        } catch {
          token = match[1]
        }
        break
      }
    }

    // Fallback: tenta obter do body
    if (!token && data && typeof data === 'object') {
      token = data.token ?? data.accessToken ?? data.access_token
    }

    if (!token) {
      console.error('Login: no token in Set-Cookie or response body. Set-Cookie headers:', setCookieHeaders.length)
      return NextResponse.json(
        {
          message: 'Authentication error',
          reason: 'NO_TOKEN',
          hint: 'Backend must return token in Set-Cookie (copyei_user) or in JSON (token/accessToken)',
          backendResponse: data,
        },
        { status: 500 }
      )
    }

    // Define o cookie no domínio do frontend (same-origin)
    const cookieStore = await cookies()
    cookieStore.set('copyei_user', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return NextResponse.json({ message: 'OK', token })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('Login proxy error:', err)
    return NextResponse.json(
      {
        message: 'Internal server error',
        reason: 'EXCEPTION',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    )
  }
}

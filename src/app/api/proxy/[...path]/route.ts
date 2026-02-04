import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  if (!API_BASE_URL) {
    return NextResponse.json({ message: 'API not configured' }, { status: 500 })
  }

  const path = pathSegments.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${path}${searchParams ? `?${searchParams}` : ''}`

  const cookieStore = await cookies()
  const token = cookieStore.get('copyei_user')?.value

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
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

  const response = await fetch(url, init)
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location')
    if (location) return NextResponse.redirect(location)
  }
  const contentType = response.headers.get('content-type') ?? ''
  const resHeaders = new Headers()
  response.headers.forEach((v, k) => {
    if (!['content-encoding', 'transfer-encoding'].includes(k.toLowerCase())) {
      resHeaders.set(k, v)
    }
  })

  if (contentType.includes('application/json')) {
    const data = await response.json()
    return NextResponse.json(data, { status: response.status, headers: resHeaders })
  }
  if (contentType.includes('application/') || contentType.includes('text/')) {
    const text = await response.text()
    return new NextResponse(text, { status: response.status, headers: resHeaders })
  }
  const blob = await response.blob()
  return new NextResponse(blob, { status: response.status, headers: resHeaders })
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

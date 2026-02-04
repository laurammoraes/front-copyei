import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Retorna o token do cookie copyei_user (httpOnly).
 * Usado como fallback quando o frontend precisa do token para o header Authorization
 * em requisições cross-origin (api.copyei.online não recebe cookies de app.copyei.online).
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('copyei_user')?.value
    if (!token) {
      return NextResponse.json({ token: null }, { status: 401 })
    }
    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ token: null }, { status: 500 })
  }
}

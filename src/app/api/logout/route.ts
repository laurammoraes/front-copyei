import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL

    // Chama o logout no backend para invalidar a sessão
    if (API_BASE_URL) {
      try {
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'GET',
          credentials: 'include',
        })
      } catch {
        // Ignora erros do backend - o importante é limpar o cookie local
      }
    }

    // Remove o cookie no domínio do frontend
    const cookieStore = await cookies()
    cookieStore.delete('copyei_user')

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

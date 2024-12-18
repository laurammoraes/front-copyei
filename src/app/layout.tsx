import React from 'react'
import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import '../styles/globals.css'
import { UserGuard } from '@/contexts/UserGuard'
import '@/styles/globals.css'
import '@/styles/toastify.css'

export const metadata: Metadata = {
  title: 'Copyei - Dashboard',
  description: 'Copyei',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br" className="scroll-smooth">
      <body className="relative min-h-screen bg-body text-text">
        <UserGuard>
          <main className="w-full">{children}</main>
        </UserGuard>
        <ToastContainer position="bottom-center" theme="light" />
      </body>
    </html>
  )
}

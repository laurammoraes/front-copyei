import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import AdminView from '@/layouts/AdminView'

export default function AdminPage() {
  const token = cookies().get('copyei_user')?.value
  if (!token) redirect('/login')

  return <AdminView />
}

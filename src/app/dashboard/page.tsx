import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import DashView from '@/layouts/DashView'

export default function DashboardPage() {
  // const token = cookies().get('copyei_user')?.value
  // if (!token) redirect('/login')

  return <DashView />
}

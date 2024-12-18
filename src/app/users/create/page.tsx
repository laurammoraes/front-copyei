import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CreateUserView from '@/layouts/CreateUserView'

export default function CreateUserPage() {
  const token = cookies().get('copyei_user')?.value
  if (!token) redirect('/login')

  return <CreateUserView />
}

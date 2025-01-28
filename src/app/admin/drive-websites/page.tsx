import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import DriveWebsitesListView from '@/layouts/DriveWebsitesListView'

export default function AdminDriveWebsitesListPage() {
  const token = cookies().get('copyei_user')?.value
  if (!token) redirect('/login')

  return <DriveWebsitesListView />
}

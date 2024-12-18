import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { UserView } from '@/layouts/UserView'

export default function UserPage() {
    const token = cookies().get('copyei_user')?.value
    if (!token) redirect('/login')

    return <UserView />
}

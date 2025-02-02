import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WebhookView from '../../layouts/WebhookView'



export default function WebhookPage() {
    const token = cookies().get('copyei_user')?.value
    if (!token) redirect('/login')

    return <WebhookView />
}

'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { parseCookies } from 'nookies'
import { useParams } from 'next/navigation'


import style from '../styles/module/page.module.css'
import { AsideBar } from '@/components/AsideBar'
import { NavBar } from '@/components/NavBar'

interface Domain {
    id: number
    domain: string
}

interface Website {
    id: string
    clone_url: string
    title: string
}

interface Log {
    type: string
    function_name: string
    created_at: string
}

interface User {
    id: string
    name: string
    email: string
    Domains: Domain[]
    Websites: Website[]
    created_at: string
    paused_at: string | null
    usageDuration: {
        days: number | null
        isPaused: boolean
    }
    logs?: Log[]
}

interface ActionButtonsProps {
    isPaused: boolean
    onPauseToggle: () => void
    onDelete: () => void
    loading: boolean
}

interface UserStatusProps {
    user: User
    onUpdate: (userData: Partial<User>) => void
    loading: boolean
}

interface Column {
    header: string
    accessor: string
}

interface DataTableProps {
    title: string
    columns: Column[]
    data: any[]
}

export function UserStatus({ user, onUpdate, loading }: UserStatusProps) {
    const cookies = parseCookies()
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
    })

    return (
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-center text-xl font-semibold">Informações do Usuário</h3>

            <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-6">
                <div>
                    <p className="text-gray-600">Nome : {user.name}</p>
                </div>
                <div>
                    <p className="text-gray-600">E-mail: {user.email}</p>
                </div>

            </div>

            <h3 className="mb-4 text-center text-xl font-semibold">Status do Usuário</h3>

            <div className="mb-6 grid grid-cols-2 gap-4 border-b pb-6">
                <div>
                    <p className="text-gray-600">Dias Ativos: {user.usageDuration.days || 0}</p>
                </div>
                <div>
                    <p className="text-gray-600">Status: {user.usageDuration.isPaused ? 'Pausado' : 'Ativo'}</p>
                </div>
            </div>
        </div>
    )
}

export function ActionButtons({ isPaused, onPauseToggle, onDelete, loading }: ActionButtonsProps) {
    return (
        <div className={style.btnContainer}>
            <button
                onClick={onPauseToggle}
                disabled={loading}
                className={`${style.btn} ${isPaused ? 'bg-green-600' : 'bg-yellow-600'}`}
            >
                {loading ? <div className={style.loader} /> : isPaused ? 'Reativar' : 'Pausar'}
            </button>
            <button onClick={onDelete} disabled={loading} className={`${style.btn} bg-red-600`}>
                {loading ? <div className={style.loader} /> : 'Excluir'}
            </button>
        </div>
    )
}

export function DataTable({ title, columns, data }: DataTableProps) {
    return (
        <div className={style.dataTable}>
            <h2 className="mb-4 text-xl font-semibold">{title}</h2>
            <table className={style.sitesTable}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex}>{item[column.accessor]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function UserView() {
    const cookies = parseCookies()
    const params = useParams()
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | null>(null)

    const fetchUser = async () => {
        try {
            setLoading(true)
            const [userResponse, logsResponse] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/user/list/${params.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${cookies.copyei_user}`,
                    },
                    cache: 'no-cache',
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/logs/${params.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${cookies.copyei_user}`,
                    },
                    cache: 'no-cache',
                }),
            ])

            const userData = await userResponse.json()
            const logsData = await logsResponse.json()

            if (!userResponse.ok) {
                throw new Error(userData.message || 'Erro ao carregar dados do usuário')
            }

            setUser({ ...userData, logs: logsData })
        } catch (error) {
            console.error('Erro ao buscar dados:', error)
            toast.error('Erro ao carregar dados. Tente novamente mais tarde.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchUser()
        }
    }, [params.id])

    // Colunas para as tabelas
    const websiteColumns = [
        { header: 'Título', accessor: 'title' },
        { header: 'Clone URL', accessor: 'clone_url' },
    ]

    const domainColumns = [{ header: 'Domínio', accessor: 'domain' }]

    const logColumns = [
        { header: 'Tipo', accessor: 'type' },
        { header: 'Nome da função', accessor: 'function_name' },
        { header: 'Data de criação', accessor: 'created_at' },
    ]

    // Handlers
    const handlePauseToggle = async () => {
        const action = user?.usageDuration.isPaused ? 'reativar' : 'pausar'
        if (!confirm(`Tem certeza que deseja ${action} este usuário?`)) {
            return
        }

        try {
            setLoading(true)
            const endpoint = user?.usageDuration.isPaused
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/user/active/${params.id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/user/pause/${params.id}`

            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${cookies.copyei_user}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao atualizar status do usuário')
            }

            toast.success(user?.usageDuration.isPaused ? 'Usuário reativado com sucesso!' : 'Usuário pausado com sucesso!')

            // Recarrega os dados do usuário
            await fetchUser()
        } catch (error) {
            toast.error('Erro ao atualizar status do usuário')
            console.error('Erro:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            return
        }

        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/user/delete/${params.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${cookies.copyei_user}`,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao deletar usuário')
            }

            toast.success('Usuário deletado com sucesso!')
            // Redirecionar para a lista de usuários
            window.location.href = '/users'
        } catch (error) {
            console.error('Erro ao deletar usuário:', error)
            toast.error('Erro ao deletar usuário. Tente novamente mais tarde.')
        } finally {
            setLoading(false)
        }
    }

    const handleUserUpdate = (userData: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...userData })
        }
    }

    return (
        <>
            <NavBar />
            <div className={style.pageContainer}>
                <AsideBar />
                <div className={style.containerAll}>
                    <div className={style.content}>
                        <div className={style.containerSitesCloned}>
                            <div className={style.contentSitesCloned}>
                                <h1 className={style.title}>CONTROLE DE USUÁRIO</h1>

                                {loading ? (
                                    <div className={style.loader} />
                                ) : user ? (
                                    <>
                                        <div className="mb-8">
                                            <UserStatus user={user} onUpdate={handleUserUpdate} loading={loading} />
                                        </div>

                                        <div className="mb-8">
                                            <div className={style.btnContainer}>
                                                <ActionButtons
                                                    isPaused={user.usageDuration?.isPaused}
                                                    onPauseToggle={handlePauseToggle}
                                                    onDelete={handleDelete}
                                                    loading={loading}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8">
                                            <DataTable title="Websites Vinculados" columns={websiteColumns} data={user.Websites || []} />
                                        </div>

                                        <div className="mt-8">
                                            <DataTable title="Domínios" columns={domainColumns} data={user.Domains || []} />
                                        </div>

                                        <div className="mt-8">
                                            <DataTable title="Histórico de falhas" columns={logColumns} data={user.logs || []} />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-600">Usuário não encontrado</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserView

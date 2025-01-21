'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { parseCookies } from 'nookies'

import style from '../styles/module/page.module.css'
import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { AsideBar } from '@/components/AsideBar'

interface User {
  id: string
  name: string
  email: string
  role: string
  paused_at: string | null
}

interface PaginatedUsers {
  data: User[]
  pagination: {
    total: number
    currentPage: number
    perPage: number
    lastPage: number
  }
}

export default function DashView() {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage] = useState(10) // Quantidade de itens por página

  const cookies = parseCookies()
  const router = useRouter()

  const handleButtonClickView = async (id: string) => {
    try {
      setLoadingUserId(id)
      router.push(`/users/${id}`)
    } catch (error) {
      toast.error('Erro ao navegar para os dados do usuário: ' + error)
    } finally {
      setLoadingUserId(null)
    }
  }

  const searchUsers = async (page: number) => {
    try {
      const searchUsers = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/list?page=${page}&per_page=${itemsPerPage}`
      const response = await fetch(searchUsers, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookies.copyei_user}`,
        },
        cache: 'no-cache',
      })

      if (!response.ok) {
        toast.error('Ocorreu um erro inesperado. Tente novamente mais tarde...')
        return
      }

      const data: PaginatedUsers = await response.json()

      setUsers(data.data)
      setTotalPages(data.pagination.lastPage)
    } catch (error) {
      console.error('Erro ao buscar usuários', error)
      toast.error('Ocorreu um erro inesperado. Tente novamente mais tarde...')
    }
  }

  useEffect(() => {
    searchUsers(currentPage)
  }, [currentPage, cookies.copyei_user])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDownloadSheet = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/download-sheet/all`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cookies.copyei_user}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao baixar planilha')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'usuarios.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Download iniciado com sucesso!')
    } catch (error) {
      toast.error('Erro ao baixar planilha de usuários')
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
                <div className={style.headerContent}>
                  <h1 className={style.title}>CONTROLE DE USUÁRIOS</h1>
                </div>
                {users.length > 0 ? (
                  <div>
                    <button onClick={handleDownloadSheet} className={style.btnDownload}>
                      Baixar Planilha
                    </button>
                    <table className={style.sitesTable}>
                      <thead className={style.containerTitleTable}>
                        <tr className={style.titleTable}>
                          <th>Nome</th>
                          <th>E-mail</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className={style.dataTable}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.paused_at ? 'Inativo' : 'Ativo'}</td>
                            <td>
                              <button className={style.btnRouteView} onClick={() => handleButtonClickView(user.id)}>
                                {loadingUserId === user.id ? (
                                  <div className={style.loader}></div>
                                ) : (
                                  <Image src={'/icons/eye.gif'} width={30} height={30} alt="view" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {users.length >= itemsPerPage && (
                      <div className={style.pagination}>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                          Anterior
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? style.activePage : ''}
                          >
                            {page}
                          </button>
                        ))}

                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                          Próximo
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Nenhum usuário cadastrado no momento.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

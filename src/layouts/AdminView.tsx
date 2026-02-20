'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { fetchAPI, getProxyHeaders } from '@/utils/fetchAPI'
import { AsideBar } from '@/components/AsideBar'
import { NavBar } from '@/components/NavBar'
import style from '../styles/module/page.module.css'
import { BlockingModal } from '@/components/BlockingModal'

/* Define o tipo de dados para os sites */
interface Site {
  id: number
  clone_url: string
  title: string
  type: 'LOCAL' | 'DRIVE'
  Domain: {
    id: number
    domain: string
  }
}

/* Componente principal da visualização das páginas */
export default function AdminView() {
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [blockingModalId, setBlockingModalId] = useState<string | null>(null)

  const handleButtonClickDelete = async (siteId: number) => {
    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição ao backend */
      const response = await fetchAPI(`/aapanel/websites/${siteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })

      /* Captar exceções */
      if (!response.ok) throw new Error('Erro ao deletar URL')

      /* Atualizar a lista de sites após a exclusão, e notificar usuário */
      toast.success('Site deletado com sucesso')
      setSites(sites.filter((site) => site.id !== siteId))
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao deletar URL. Tente novamente mais tarde...')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  const handleButtonClickView = async (domain: string, siteId: number, title: string) => {
    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição ao backend (backend encontra o site pelo title) */
      const siteUrl = title
      const response = await fetch(`/api/proxy/site/${siteUrl}`, {
        credentials: 'include',
        headers: getProxyHeaders(),
      })

      /* Captar exceções */
      if (!response.ok) {
        toast.info('Ops... Parece que o site está no processo de clonagem! Aguarde alguns segundos.')
        return
      }

      window.open(`/api/proxy/site/${siteUrl}`, '_blank')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao visualizar a página')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  const handleButtonDownloadSite = async (domain: string, title: string, type: 'LOCAL' | 'DRIVE') => {
    if (type === 'DRIVE') {
      toast.info('Você não pode editar um site que está armazenado no Google Drive')
      return
    }

    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição ao backend (backend encontra o site pelo title) */
      const siteUrl = title
      const response = await fetch(`/api/proxy/download/${siteUrl}`, {
        credentials: 'include',
        headers: getProxyHeaders(),
      })

      /* Captar exceções */
      if (!response.ok) throw new Error('Ocorreu um erro ao fazer download do site. Tente novamente mais tarde...')

      /* Fazer download do site */
      toast.info('O Site está sendo baixado!')
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', `${siteUrl}.zip`)

      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao fazer download do site. Tente novamente mais tarde...')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  /* Função para lidar com o clique no botão de edição do site */
  const handleButtonClickEdit = async (domain: string, siteId: number, title: string, type: 'LOCAL' | 'DRIVE') => {
    if (type === 'DRIVE') {
      toast.info('Você não pode editar um site que está armazenado no Google Drive')
      return
    }

    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição ao backend (backend encontra o site pelo title) */
      const siteUrl = title
      const response = await fetch(`/api/proxy/editor/${siteUrl}`, {
        credentials: 'include',
        headers: getProxyHeaders(),
      })

      if (!response.ok) throw new Error('Ocorreu um erro ao abrir o editor. Tente novamente mais tarde...')

      window.open(`/api/proxy/editor/${siteUrl}`, '_blank')
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao abrir o editor. Tente novamente mais tarde...')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  const handleButtonDownloadHtml = async (domain: string, title: string, type: 'LOCAL' | 'DRIVE') => {
    if (type === 'DRIVE') {
      toast.info('Você não pode editar um site que está armazenado no Google Drive')
      return
    }

    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição ao backend (backend encontra o site pelo title) */
      const siteUrl = title
      const response = await fetch(`/api/proxy/download/${siteUrl}/html`, {
        credentials: 'include',
        headers: getProxyHeaders(),
      })

      /* Captar exceções */
      if (!response.ok) throw new Error('Ocorreu um erro ao baixar HTML. Tente novamente mais tarde...')

      /* Fazer download do html */
      toast.info('O HTML está sendo baixado!')
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', 'index.html')

      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao baixar HTML. Tente novamente mais tarde...')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const searchSites = async () => {
      try {
        const sitesResponse = await fetchAPI<{ sites?: Site[] }>('/searchSites?type=LOCAL', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
        })
        const { data } = sitesResponse

        /* Captar exceções */
        if (!sitesResponse.ok) throw new Error('Ocorreu um erro inesperado. Tente novamente mais tarde...')

        setSites(data?.sites || [])
      } catch (error) {
        console.error(error)
        toast.error('Ocorreu um erro inesperado. Tente novamente mais tarde...')
      }
    }

    searchSites()
  }, [])

  return (
    <>
      <NavBar />
      <div className={style.pageContainer}>
        <AsideBar />
        <div className={style.containerAll}>
          <div className={style.content}>
            <div className={style.containerSitesCloned}>
              <div className={style.contentSitesCloned}>
                <h1 className={style.title}>Páginas hospedadas na Copyei</h1>
                {sites.length > 0 ? (
                  <table className={style.sitesTable}>
                    <thead className={style.containerTitleTable}>
                      <tr className={style.titleTable}>
                        <th>Site</th>
                        <th>Domínio</th>
                        <th>Site Clonado</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sites.map((site) => (
                        <tr key={site.id} className={style.dataTable}>
                          <td>{site.title}</td>
                          <td>{site.Domain.domain.replace('https://', '')}</td>
                          <td className={style.textSiteCloned}>{site.clone_url.replace('https://', '')}</td>
                          <td>
                            <button
                              className={style.btnRouteEdit}
                              type="button"
                              onClick={() => handleButtonClickEdit(site.Domain.domain, site.id, site.title, site.type)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className={style.loader}></div>
                              ) : (
                                <Image src={'/icons/edit.gif'} width={30} height={30} alt="edit" unoptimized />
                              )}
                            </button>

                            <button
                              className={style.btnRouteView}
                              type="button"
                              onClick={() => handleButtonClickView(site.Domain.domain, site.id, site.title)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className={style.loader}></div>
                              ) : (
                                <Image src={'/icons/eye.gif'} width={30} height={30} alt="edit" unoptimized />
                              )}
                            </button>

                            <div className={style.downloadDropdown}>
                              <button className={style.btnDownloadSite} type="button" disabled={isLoading}>
                                {isLoading ? (
                                  <div className={style.loader}></div>
                                ) : (
                                  <Image src={'/icons/download-site.png'} width={30} height={30} alt="download" />
                                )}
                              </button>
                              <div className={style.downloadOptions}>
                                <button
                                  onClick={() => handleButtonDownloadSite(site.Domain.domain, site.title, site.type)}
                                  type="button"
                                  disabled={isLoading}
                                >
                                  ZIP
                                </button>
                                <button
                                  onClick={() => handleButtonDownloadHtml(site.Domain.domain, site.title, site.type)}
                                  type="button"
                                  disabled={isLoading}
                                >
                                  HTML
                                </button>
                              </div>
                            </div>

                            <button
                              className={style.btnRouteBin}
                              type="button"
                              onClick={() => handleButtonClickDelete(site.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className={style.loader}></div>
                              ) : (
                                <Image src={'/icons/bin.gif'} width={30} height={30} alt="edit" unoptimized />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Nenhum site clonado no momento.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {blockingModalId && <BlockingModal blockingModalId={blockingModalId} setBlockingModalId={setBlockingModalId} />}
    </>
  )
}

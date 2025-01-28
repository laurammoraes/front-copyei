'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { CopySimple } from '@phosphor-icons/react'
import { parseCookies } from 'nookies'

import { fetchAPI } from '@/utils/fetchAPI'
import { AsideBar } from '@/components/AsideBar'
import { NavBar } from '@/components/NavBar'
import style from '../styles/module/page.module.css'

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
export default function DriveWebsitesListView() {
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const cookies = parseCookies()

  const handleButtonClickDelete = async (siteId: number) => {
    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição ao backend */
      const response = await fetchAPI(`/aapanel/websites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookies.copyei_user}`,
        },
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

      /* Fazer requisição ao backend */
      const siteUrl = process.env.NEXT_PUBLIC_NODE_ENV === 'development' ? title : domain
      const viewSiteUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/site/${siteUrl}`
      const response = await fetch(viewSiteUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cookies.copyei_user}`,
        },
      })

      /* Captar exceções */
      if (!response.ok) {
        toast.info('Ops... Parece que o site está no processo de clonagem! Aguarde alguns segundos.')
        return
      }

      /* Redirecionar usuário */
      window.open(viewSiteUrl, '_blank')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao visualizar a página')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const searchSites = async () => {
      try {
        /* Fazer requisição para backend */
        const sitesResponse = await fetchAPI<{ sites?: Site[] }>('/searchSites?type=DRIVE', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cookies.copyei_user}`,
          },
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
  }, [cookies.copyei_user])

  return (
    <>
      <NavBar />
      <div className={style.pageContainer}>
        <AsideBar />
        <div className={style.containerAll}>
          <div className={style.content}>
            <div className={style.containerSitesCloned}>
              <div className={style.contentSitesCloned}>
                <h1 className={style.title}>Páginas hospedadas no Google Drive</h1>
                {sites.length > 0 ? (
                  <table className={style.sitesTable}>
                    <thead className={style.containerTitleTable}>
                      <tr className={style.titleTable}>
                        <th>Site</th>
                        <th>Site Clonado</th>
                        <th>Link de acesso</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sites.map((site) => (
                        <tr key={site.id} className={style.dataTable}>
                          <td>{site.title}</td>
                          <td className={style.textSiteCloned}>{site.clone_url.replace('https://', '')}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className={style.buttonCopyToClipboard}
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://${site.title}.zr0.online`)
                                  toast.success('Link copiado!')
                                }}
                                title="Copiar para a área de transferência"
                              >
                                <CopySimple size={24} />
                              </button>
                              <span className="text-sm">https://{site.title}.zr0.online</span>
                            </div>
                          </td>
                          <td>
                            <button
                              className={style.btnRouteView}
                              type="button"
                              onClick={() => handleButtonClickView(site.Domain.domain, site.id, site.title)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className={style.loader}></div>
                              ) : (
                                <Image src={'/icons/eye.gif'} width={30} height={30} alt="edit" />
                              )}
                            </button>

                            <button
                              className={style.btnRouteBin}
                              type="button"
                              onClick={() => handleButtonClickDelete(site.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className={style.loader}></div>
                              ) : (
                                <Image src={'/icons/bin.gif'} width={30} height={30} alt="edit" />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Nenhum site armazenado no Google Drive no momento.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

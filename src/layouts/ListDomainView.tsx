'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { fetchAPI } from '@/utils/fetchAPI'
import { AsideBar } from '@/components/AsideBar'
import { NavBar } from '@/components/NavBar'
import style from '../styles/module/page.module.css'

interface Domains {
  id: number
  domain: string
}

/* Componente principal da visualização das páginas */
export default function ListDomainView() {
  const [domains, setDomains] = useState<Domains[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  /* Função para excluir o domínio */
  const handleDeleteDomain = async (domain: string) => {
    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição para backend */
      const deleteDomainResponse = await fetchAPI('/domain', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })

      if (!deleteDomainResponse.ok) throw new Error('Ocorreu um erro ao deletar domínio. Tente novamente mais tarde...')

      /* Retorna mensagem ao usuário */
      toast.success('Domínio excluído com sucesso.')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao deletar domínio. Tente novamente mais tarde...')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  /* Busca os domínios existentes */
  useEffect(() => {
    const searchSites = async () => {
      try {
        /* Fazer requisição para backend */
        const domainsResponse = await fetchAPI<{ domains?: Domains[] }>('/searchSites', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache',
        })
        const { data } = domainsResponse

        /* Captar exceções */
        if (!domainsResponse.ok) throw new Error('Ocorreu um erro inesperado. Tente novamente mais tarde...')

        /* Atualiza o estado com os sites clonados */
        setDomains(data?.domains || [])
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
                <h1 className={style.title}>DOMÍNIOS REGISTRADOS</h1>

                <div className={style.divbtnRouteAddDomain}>
                  <a
                    href="/admin/criarDominio"
                    style={{ display: 'block', textDecoration: 'none' }}
                    className={style.btnRouteAddDomain}
                  >
                    ADICIONAR DOMÍNIO
                  </a>
                </div>

                {domains.length > 0 ? (
                  <table className={style.sitesTable}>
                    <thead className={style.containerTitleTable}>
                      <tr className={style.titleTable}>
                        <th>Domínio</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain) => (
                        <tr key={domain.id} className={style.dataTable}>
                          <td>{domain.domain.replace('https://', '')}</td>
                          <td>
                            <button
                              className={style.btnRouteBin}
                              type="button"
                              onClick={() => handleDeleteDomain(domain.domain)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <div className={style.loader}></div>
                              ) : (
                                <Image src={'/icons/bin.gif'} width={30} height={30} alt="delete" unoptimized />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  'Não há nenhum domínio registrado'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

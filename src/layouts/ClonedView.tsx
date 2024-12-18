'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { parseCookies } from 'nookies'
import Select, { SingleValue } from 'react-select'

import { fetchAPI } from '@/utils/fetchAPI'
import { AsideBar } from '@/components/AsideBar'
import { NavBar } from '@/components/NavBar'
import style from '../styles/module/page.module.css'

/* Função para validar uma URL */
const validateUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (error) {
    return false
  }
}

/* Tipo para o domínio */
interface Domains {
  id: number
  domain: string
}

interface FilteredDomains {
  value: number
  label: string
}

export default function ClonedView() {
  const [domainSelect, setDomainSelect] = useState<number | null>(null)
  const [urlSiteToClone, setUrlSiteToClone] = useState('')
  const [titleSite, setTitleSite] = useState('')
  const [domains, setDomains] = useState<FilteredDomains[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const cookies = parseCookies()

  /* Função para lidar com o envio do formulário de clonagem de site */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    /* Verifica se o domínio foi fornecido */
    if (domainSelect === null) {
      toast.info('Domínio do site não informado!')
      return
    }

    /* Validar título fornecido */
    const titleRegex = /^[a-zA-Z0-9]+$/
    if (!titleSite || !titleRegex.test(titleSite)) {
      toast.info('O título do site deve conter apenas letras e números!')
      return
    }

    /* Validar URL fornecida  */
    const urlRegex =
      // eslint-disable-next-line prettier/prettier
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
    if (!urlSiteToClone || !urlRegex.test(urlSiteToClone) || !validateUrl(urlSiteToClone)) {
      toast.info('A URL do site para clonar é inválida! Use uma URL completa, como https://www.site.com')
      return
    }

    try {
      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Faz uma solicitação POST para o backend */
      const cloneResponse = await fetchAPI<{ message?: string }>('/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookies.copyei_user}`,
        },
        body: JSON.stringify({ url: urlSiteToClone, domainId: domainSelect, title: titleSite }),
      })
      const { data } = cloneResponse

      /* Captar exceções */
      if (data?.message && data?.message === 'URL não encontrada') {
        toast.info('A URL informada é inválida.')
        return
      }
      if (data?.message && data?.message === 'Usuário não encontrado') {
        toast.info('Sua sessão expirou, faça o login novamente.')
        return
      }
      if (data?.message && data?.message === 'Domínio não encontrado') {
        toast.info('O domínio escolhido não foi encontrado pelo sistema.')
        return
      }
      if (data?.message && data?.message === 'Site já existente') {
        toast.info('Já existe um site com esse nome.')
        return
      }
      if (
        data?.message &&
        data?.message === 'Você chegou no limite de clones dos sites. Para continuar, exclua um de seus sites clonados.'
      ) {
        toast.info('Você chegou no limite de clones dos sites. Para continuar, exclua um de seus sites clonados.')
        return
      }

      /* Verifica se a resposta não foi bem-sucedida e notifica o usuário */
      if (!cloneResponse.ok) throw new Error('Ocorreu um erro ao clonar o site. Tente novamente mais tarde...')

      /* Mensagem de sucesso */
      toast.success('O site está sendo clonado. Aguarde alguns instantes!')
      setUrlSiteToClone('')
      setDomainSelect(null)
      setTitleSite('')
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao clonar o site. Tente novamente mais tarde...')
    } finally {
      /* Finaliza estado de carregamento */
      setIsLoading(false)
    }
  }

  /* Função para lidar com mudanças na seleção do domínio */
  const handleSelectChange = (selectedOption: SingleValue<FilteredDomains>) => {
    setDomainSelect(selectedOption ? selectedOption.value : null)
  }

  /* Carrega os domínios disponíveis para clonagem */
  useEffect(() => {
    const searchDomains = async () => {
      try {
        /* Fazer requisição ao backend */
        const domainsResponse = await fetchAPI<{ domains?: Domains[] }>('/searchSites', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cookies.copyei_user}`,
          },
        })
        const { data } = domainsResponse

        /* Captar exceções */
        if (!domainsResponse.ok) throw new Error('Ocorreu um erro inesperado. Tente novamente mais tarde...')

        setDomains(
          data?.domains?.map((item) => ({
            value: item.id,
            label: item.domain,
          })) || [],
        )
      } catch (error) {
        console.error(error)
        toast.error('Ocorreu um erro inesperado. Tente novamente mais tarde...')
      }
    }

    searchDomains()
  }, [cookies.copyei_user])

  /* Custom styles for react-select */
  const customStyles = {
    control: (base: any) => ({
      ...base,
      padding: '0.2rem',
      borderRadius: '0.5rem',
      marginTop: '0.2rem',
      fontFamily: 'var(--font-lexend)',
      border: '0.1rem solid var(--color-grey)',
      '&:hover': {
        borderColor: 'black',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      marginTop: '0.5rem',
      borderRadius: '0.5rem',
      borderBottom: '0.2rem solid var(--color-purple)',
      backgroundColor: state.isFocused ? 'var(--color-purple-dark)' : 'white',
      color: state.isFocused ? 'white' : 'black',
      '&:hover': {
        backgroundColor: 'var(--color-purple-dark)',
        color: 'white',
      },
    }),
  }

  return (
    <>
      <NavBar />
      <div className={style.pageContainer}>
        <AsideBar />
        <div className={style.containerAll}>
          <div className={style.content}>
            <form onSubmit={handleSubmit} className={style.form} method="post">
              <div className={style.divClone}>
                <h1 className={style.title}>CLONE SEU SITE</h1>

                <div className={style.divInput}>
                  <label htmlFor="title">Nome do Site</label>
                  <input
                    type="text"
                    name="titleSite"
                    id="titleSite"
                    className={style.input}
                    placeholder="Ex.: MeuSite.com"
                    value={titleSite}
                    onChange={(e) => setTitleSite(e.target.value)}
                  />
                </div>

                <div className={style.divInput}>
                  <label htmlFor="domain">Domínio</label>
                  <Select
                    id="domain"
                    classNamePrefix="custom-select"
                    value={domains.find((domain) => domain.value === domainSelect) || null}
                    onChange={handleSelectChange}
                    options={domains}
                    placeholder="Selecione um domínio"
                    styles={customStyles}
                  />
                </div>

                <div className={style.divInput}>
                  <label htmlFor="clonePage">Link da página que será clonada</label>
                  <input
                    type="text"
                    name="clonePage"
                    id="clonePage"
                    className={style.input}
                    placeholder="Ex.: https://clone.com.br"
                    value={urlSiteToClone}
                    onChange={(e) => setUrlSiteToClone(e.target.value)}
                  />
                </div>
              </div>

              <div className={style.divBtnSend}>
                <button className={style.btnSend} type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className={style.loader}></div>
                  ) : (
                    <>
                      <Image src={'/icons/fork.gif'} alt="Fork" width={30} height={30} /> CLONAR
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

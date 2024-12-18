'use client'

import React, { FormEvent, useState } from 'react'
import { parseCookies } from 'nookies'
import { toast } from 'react-toastify'

import { fetchAPI } from '@/utils/fetchAPI'
import { AsideBar } from '@/components/AsideBar'
import { NavBar } from '@/components/NavBar'
import style from '../styles/module/page.module.css'

export default function DomainView() {
  const [domain, setDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const cookies = parseCookies()

  /* Função para lidar com o envio do formulário de criação de domínio */
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    try {
      if (!domain) {
        toast.info('Você deve preencher o campo de domínio.')
        return
      }

      /* Inicia estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição para backend */
      const createDomainResponse = await fetchAPI<{ message?: string }>('/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookies.copyei_user}`,
        },
        body: JSON.stringify({ domain }),
      })
      const { data } = createDomainResponse

      if (data?.message && data?.message === 'Este domínio já está cadastrado') {
        toast.info('Domínio já existente.')
        return
      }
      if (!createDomainResponse.ok)
        throw new Error('Ocorreu um erro ao cadastrar domínio. Tente novamente mais tarde...')

      toast.success('Domínio cadastrado com sucesso.')
      setDomain('')
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro ao cadastrar domínio. Tente novamente mais tarde...')
    } finally {
      /* Finalizar estado de carregamento */
      setIsLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className={style.pageContainer}>
        <AsideBar />
        <div className={style.containerAll}>
          <div className={style.content}>
            <div className={style.contentCreateDomain}>
              <div className={style.divTitle}>
                <h1 className={style.title}>Como configurar seu Domínio:</h1>
              </div>
              <div className={style.divSubtitle}>
                <p className={style.subtitle}>
                  1º Acesse seu provedor onde realizou a compra do seu domínio, e adicione uma TAG &quot;A&quot;
                  apontando para este IP: 89.28.236.8
                </p>
                <p className={style.subtitle}>2º passo: Cadastre o seu domínio no Copyei (no input abaixo)</p>
              </div>
              <form onSubmit={handleSubmit} className={style.formCreateDomain}>
                <div>
                  <input
                    type="text"
                    name="CreateDomain"
                    id="CreateDomain"
                    placeholder="Digite seu domínio"
                    className={style.input}
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
                <button className={style.btnRouteAddDomain} type="submit" disabled={isLoading}>
                  {isLoading ? <div className={style.loader}></div> : 'CADASTRAR DOMÍNIO'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

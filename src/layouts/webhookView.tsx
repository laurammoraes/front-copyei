'use client'
import React, { useState } from 'react'

import { Button } from '../components/ui/Button'
import { Copy } from 'lucide-react'
import style from '../styles/module/webhook-generator.module.css'
import { NavBar } from '@/components/NavBar'
import { AsideBar } from '@/components/AsideBar'

export default function QueryUrlGenerator() {
  const [baseUrl] = useState('https://app.copyei.com/api/payment/actionAccount')
  const [queries, setQueries] = useState([
    { key: 'plan_type', label: 'Tipo do plano', value: 'anual' },
    { key: 'daysUntilActivation', label: 'Dias para Ativação', value: '' },
    { key: 'trigger', label: 'Evento Disparador', value: 'compra aprovada' },
  ])
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const updateQuery = (index: number, key: string, value: string) => {
    const updatedQueries = [...queries]
    updatedQueries[index] = { ...updatedQueries[index], key, value }
    setQueries(updatedQueries)
  }

  const generateUrl = () => {
    const queryString = queries
      .filter((q) => q.key && q.value)
      .map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`)
      .join('&')
    setGeneratedUrl(`${baseUrl}?${queryString}`)
    setCopied(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <NavBar />
      <div className={style.pageContainer}>
        <AsideBar />
        <div className={style.containerAll}>
          <div className={style.content}>
            <h1 className={style.title}>Gerador de webhook para gestão de contas</h1>
            <div className={style.card}>
              <div className={style.cardContent}>
                {queries.map((query, index) => (
                  <div key={index} className={style.inputGroup}>
                    <label className={style.label}>{query.label}</label>
                    {query.key === 'plan_type' ? (
                      <select
                        value={query.value}
                        onChange={(e) => updateQuery(index, query.key, e.target.value)}
                        className={style.select}
                      >
                        <option value="anual">Anual</option>
                        <option value="mensal">Mensal</option>
                      </select>
                    ) : query.key === 'trigger' ? (
                      <select
                        value={query.value}
                        onChange={(e) => updateQuery(index, query.key, e.target.value)}
                        className={style.select}
                      >
                        <option value="reembolso processado">Reembolso Processado</option>
                        <option value="compra aprovada">Compra Aprovada</option>
                        <option value="assinatura cancelada">Assinatura Cancelada</option>
                        <option value="assinatura atrasada">Assinatura Atrasada</option>
                        <option value="chargeback">Chargeback</option>
                      </select>
                    ) : (
                      <input
                        className={style.input}
                        placeholder={query.key}
                        value={query.value}
                        onChange={(e) => updateQuery(index, query.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={generateUrl} className={style.btnSend}>
              Gerar URL
            </Button>
            {generatedUrl && (
              <div className={style.card}>
                <div className={style.cardContent}>
                  <textarea className={style.textarea} readOnly value={generatedUrl} />
                  <Button onClick={copyToClipboard} className={style.btnCopy}>
                    <Copy className="h-5 w-5" /> {copied ? 'Copiado!' : 'Copiar URL'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

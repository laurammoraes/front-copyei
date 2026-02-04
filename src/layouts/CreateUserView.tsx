'use client'

import React, { FormEvent, useState } from 'react'
import { toast } from 'react-toastify'
import { getAuthHeaders } from '@/utils/fetchAPI'
import style from '../styles/module/page.module.css'
import { NavBar } from '@/components/NavBar'
import { AsideBar } from '@/components/AsideBar'

export default function CreateUserView() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!name) {
      toast.info('Nome do usuário não informado!')
      return
    }

    if (!email) {
      toast.info('Email do usuário não informado!')
      return
    }

    const urlCreateUser = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/create`

    try {
      setLoading(true)
      const response = await fetch(urlCreateUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ name, email }),
      })

      if (!response.ok) {
        const responseText = await response.text()
        toast.error(responseText)
        return
      }

      toast.success('Usuário cadastrado com sucesso!')
      setName('')
      setEmail('')
    } catch (error) {
      toast.error('Ocorreu um erro ao cadastrar o usuário. Tente novamente mais tarde...')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: FormEvent) => {
    event.preventDefault()

    if (!selectedFile) {
      toast.info('Selecione uma planilha Excel para upload!')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      setUploadLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/upload-sheet/create-many-users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const responseText = await response.text()
        toast.error(responseText)
        return
      }

      toast.success('Usuários importados com sucesso!')
      setSelectedFile(null)
    } catch (error) {
      toast.error('Erro ao importar usuários. Tente novamente mais tarde...')
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className={style.pageContainer}>
        <AsideBar />
        <div className={style.containerAll}>
          <div className={style.content}>
            <form onSubmit={handleSubmit} className={style.form} method="post" style={{ marginBottom: '1rem' }}>
              <div className={style.divClone}>
                <h1 className={style.title}>CADASTRAR USUÁRIO</h1>

                <div className={style.divInput}>
                  <label htmlFor="name">Nome do Usuário</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className={style.input}
                    placeholder="Ex.: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className={style.divInput}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className={style.input}
                    placeholder="Ex.: joao@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={style.divBtnSend}>
                <button className={style.btnSend} type="submit">
                  {loading ? <div className={style.loader}></div> : 'CADASTRAR'}
                </button>
              </div>
            </form>

            <div className={style.divider} style={{ margin: '0.5rem 0' }}>
              <span>OU</span>
            </div>

            <form onSubmit={handleFileUpload} className={style.form} style={{ marginTop: '1rem' }}>
              <div className={style.divClone}>
                <h2 className={style.subtitle}>IMPORTAR USUÁRIOS VIA PLANILHA</h2>

                <div className={style.divInput}>
                  <label htmlFor="excel">Selecione a planilha Excel</label>
                  <input
                    type="file"
                    id="excel"
                    accept=".xlsx, .xls"
                    className={style.input}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className={style.divBtnSend}>
                <button className={style.btnSend} type="submit" disabled={!selectedFile}>
                  {uploadLoading ? <div className={style.loader}></div> : 'IMPORTAR PLANILHA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

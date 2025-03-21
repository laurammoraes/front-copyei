'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import style from '../styles/module/login-register.module.css'

export default function ErrorView() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Ocorreu um erro inesperado.'

  return (
    <div className={style.containerAll}>
      <div className={style.form}>
        <h1 className={style.logo}>COPYEI</h1>
        <p className={style.errorMessage}>{message}</p>
        <a className={style.link} href="/">
          Voltar para o início
        </a>
      </div>
    </div>
  )
}

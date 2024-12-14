import React from 'react'
import style from '../styles/module/page.module.css'

export default function Loading() {
  return (
    <div className={style.loadingPage}>
      <h1 className={style.titleLoading}>Carregando...</h1>
    </div>
  )
}

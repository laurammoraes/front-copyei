'use client'

import React, { useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { UserContext } from '@/contexts/UserContext'
import style from './styles.module.css'

export function AsideBar() {
  const { user } = useContext(UserContext)

  return (
    <>
      <section className={style.sideBar}>
        <div className={style.divContentSideBar}>
          <a href="/admin" className={style.logo}>
            COPYEI
          </a>

          <div className={style.divMyPagesSideBar}>
            <span className={style.titleLinks}>PÁGINAS NA COPYEI</span>
            <a href="/admin" className={style.Link}>
              <Image src={'/icons/items.gif'} width={30} height={30} alt="items"></Image>Minhas páginas
            </a>
          </div>

          {user && user.role === 'ADMIN' && (
            <div className={style.divMyPagesSideBar}>
              <span className={style.titleLinks}>PÁGINAS NO GOOGLE DRIVE</span>
              <a href="/admin/drive-websites" className={style.Link}>
                <Image src={'/icons/items.gif'} width={30} height={30} alt="items"></Image>Meu Drive
              </a>
            </div>
          )}

          <div className={style.divMyPagesSideBar}>
            <span className={style.titleLinks}>CLONAR</span>
            <a href="/admin/clonar" className={style.Link}>
              <Image src="/icons/fork.gif" width={30} height={30} alt="items"></Image>Clonar Uma Página
            </a>
          </div>

          {user && user.role === 'ADMIN' && (
            <div className={style.divMyPagesSideBar}>
              <span className={style.titleLinks}>DOMÍNIOS</span>
              <a href="/admin/dominios" className={style.Link}>
                <Image src={'/icons/domains.gif'} width={30} height={30} alt="items"></Image>Meus Domínios
              </a>
            </div>
          )}

          {user && user.role === 'ADMIN' && (
            <div className={style.divMyPagesSideBar}>
              <span className={style.titleLinks}>DASHBOARD</span>
              <Link href={'/dashboard'} className={style.Link}>
                <Image src={'/icons/items.gif'} width={30} height={30} alt="dash"></Image>Dashboard de usuários
              </Link>
            </div>
          )}

          {user && user.role === 'ADMIN' && (
            <div className={style.divMyPagesSideBar}>
              <span className={style.titleLinks}>ADICIONAR USUÁRIOS</span>
              <Link href={'/users/create'} className={style.Link}>
                <Image src={'/icons/person.gif'} width={30} height={30} alt="dash"></Image>Adicionar usuários
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

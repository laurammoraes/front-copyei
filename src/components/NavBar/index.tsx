'use client'

import React, { useContext } from 'react'
import Image from 'next/image'

import style from './styles.module.css'
import { UserContext } from '@/contexts/UserContext'

export function NavBar() {
  const { user, logout } = useContext(UserContext)

  return (
    <>
      <section className={style.topBar}>
        <div className={style.containerAll}>
          <div className={style.divApresentation}>
            <div className={style.apresentation}>
              <Image src={'/icons/person.gif'} width={30} height={30} alt="person" />
              <h4 className={style.title}>
                Bem-vindo, <span className={style.markText}>{user?.name || null}!</span>
              </h4>
            </div>
          </div>
          <div className={style.divExitButton}>
            <button className={style.buttonExit} onClick={async () => await logout()}>
              <Image src={'/icons/exit.gif'} width={40} height={40} alt="exit" />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

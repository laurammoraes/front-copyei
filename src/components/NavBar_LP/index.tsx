'use client'

import Image from 'next/image'
import style from './style.module.css'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export function NewNavBar() {
  return (
    <>
      <div className={style.topBar}>
        <div className={style.containerAll}>
          <div className={style.logoContainer}>
            <Image
              src="/images/logo-copyei.jpeg"
              alt="Copyei"
              fill
              sizes="(max-width: 768px) 100vw, 
                     (max-width: 1200px) 50vw, 
                     33vw"
              priority
              style={{ objectFit: 'contain' }}
              className={style.logo}
            />
          </div>
          <div className={style.divApresentation}>
            <Link href="/login" passHref>
              <button className={style.btnLogin}>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

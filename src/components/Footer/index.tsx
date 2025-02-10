import Image from 'next/image'
import style from './style.module.css'

export function Footer() {
  return (
    <div className={style.container}>
      <div className={style.logoWrapper}>
        <Image src="/images/logo-copyei.jpeg" alt="Copyei" width={150} height={50} priority />
      </div>
    </div>
  )
}

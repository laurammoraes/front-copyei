import React, { useEffect } from 'react'
import { connect } from 'socket.io-client'

import style from './styles.module.css'
import { useRouter } from 'next/navigation'


interface BlockingModalProps {
  blockingModalId: string
}

export function BlockingModal({ blockingModalId }: BlockingModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!blockingModalId) return
  
    const socket = connect(process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL!)
  
    socket.emit("join", `uploading-${blockingModalId}`)
  
    socket.on("update-loading-state", (website) => {
      if (website === blockingModalId) {
        router.push("/admin/drive-websites")
      }
    })
  
    socket.on("upload-error", (data) => {
      if (data.website === blockingModalId) {
        console.error(`Erro no upload: ${data.error}`)
        alert(`Erro ao fazer upload do site: ${data.error}`) // Ou exibir de outra forma
      }
    })
  
    return () => {
      socket.off("update-loading-state")
      socket.off("upload-error") // Removendo o listener do erro
    }
  }, [blockingModalId])
  

  return (
    <>
      <div className={style.blockingModalOverlay}></div>
      <div className={style.blockingModal}>
        <img className={style.blockingModalImage} src="/icons/drive.jpeg" alt="Logo Drive" />
        <span className={style.blockingModalText}>Aguarde enquanto carregamos o site no Google Drive.</span>
        <span className={style.blockingModalText}>Isso pode levar alguns minutos...</span>
        <div className={style.blockingModalLoadingDiv}>
          <span className={style.blockingModalLoading}></span>
        </div>
      </div>
    </>
  )
}

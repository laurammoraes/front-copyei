'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import style from '../styles/module/login-register.module.css'
import { fetchAPI } from '@/utils/fetchAPI'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const RecoveryPasswordSchema = z.object({
    email: z
        .string({ required_error: 'Campo Obrigatório' })
        .min(1, 'Campo Obrigatório')
        .email('Este campo deve ser um email'),

})
type RecoveryPasswordType = z.infer<typeof RecoveryPasswordSchema>

export default function RecoveryPasswordView() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const methods = useForm<RecoveryPasswordType>({
        resolver: zodResolver(RecoveryPasswordSchema),
        defaultValues: {
            email: undefined,
        },
    })
    const { handleSubmit, setError } = methods
    async function handleRegister(formsData: RecoveryPasswordType) {


        try {

            setIsLoading(true)

            /* Fazer requisição para backend */
            const registerResponse = await fetchAPI<{ message?: string }>('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formsData.email,
                }),
            })

            if (!registerResponse.ok) throw new Error('Ocorreu um erro. Tente novamente mais tarde...')

            toast.info('E-mail enviado com sucesso!')
        } catch (error) {
            toast.error('Ocorreu um erro. Tente novamente mais tarde...')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={style.containerAll}>
            <FormProvider {...methods}>
                <form className={style.form} onSubmit={handleSubmit(handleRegister)}>
                    <h1 className={style.logo}>COPYEI</h1>
                    <p>Insira seu e-mail no campo abaixo e clique em "Recuperar Senha". Em seguida, você receberá um e-mail com um link para redefinir sua senha.</p>
                    <Input.Root className={style.inputRoot}>
                        <Input.Label title="Email" />
                        <Input.InputField registerId="email" placeholder="Digite seu Email" className={style.input} />
                        <Input.Error className={style.errorMessage} registerId="email" />
                    </Input.Root>

                    <Button className={style.btn} type="submit" disabled={isLoading}>
                        {isLoading ? <div className={style.loader}></div> : 'Recuperar senha'}
                    </Button>
                </form>
            </FormProvider>
        </div>
    )
}
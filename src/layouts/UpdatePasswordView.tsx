'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation' // Adicionando useParams
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import style from '../styles/module/login-register.module.css'
import { fetchAPI } from '@/utils/fetchAPI'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

/* Schema de validação do formulário de registro */
const UpdatePasswordSchema = z.object({
    password: z
        .string({ required_error: 'Campo Obrigatório' })
        .regex(/^(?=.*[a-zA-Z])/, 'A senha deve conter uma letra')
        .regex(/^(?=.*\d)/, 'A senha deve conter um número')
        .regex(/^(?=.*[@.#$!%*?&^])/, 'A senha deve conter um caractere especial')
        .min(6, 'Mínimo de 6 caracteres')
        .max(72, 'Máximo de 72 caracteres'),
    repeatPassword: z
        .string({ required_error: 'Campo Obrigatório' })
        .min(6, 'Mínimo de 6 caracteres')
        .max(72, 'Máximo de 72 caracteres'),
})
type UpdatePasswordType = z.infer<typeof UpdatePasswordSchema>

export function UpdatePasswordView() {
    const router = useRouter()
    const { id } = useParams() // Usando useParams para pegar o id da URL
    const [isLoading, setIsLoading] = useState(false)
    const methods = useForm<UpdatePasswordType>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            password: undefined,
            repeatPassword: undefined,
        },
    })
    const { handleSubmit, setError } = methods

    async function handleRegister(formsData: UpdatePasswordType) {
        if (formsData.password !== formsData.repeatPassword) {
            setError('repeatPassword', { message: 'As senhas não coincidem' })
            return
        }

        try {
            /* Iniciar estado de carregamento */
            setIsLoading(true)

            const registerResponse = await fetchAPI<{ message?: string }>(`/api/recover-password/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: formsData.password,
                    repeatPassword: formsData.repeatPassword,
                }),
            })

            if (!registerResponse.ok) {



                if (registerResponse.status === 404) {
                    throw new Error('Endpoint não encontrado. Verifique o caminho da API.')
                } else {
                    throw new Error('Ocorreu um erro. Tente novamente mais tarde.')
                }
            }

            const data = registerResponse
            if (!registerResponse.ok) throw new Error('Ocorreu um erro. Tente novamente mais tarde...')

            toast.info('Senha alterada com sucesso')
            router.push('/login')
        } catch (error: any) {
            toast.error(error.message || 'Ocorreu um erro. Tente novamente mais tarde...')
        } finally {
            /* Encerrar estado de carregamento */
            setIsLoading(false)
        }
    }

    return (
        <div className={style.containerAll}>
            <FormProvider {...methods}>
                <form className={style.form} onSubmit={handleSubmit(handleRegister)}>
                    <h1 className={style.logo}>COPYEI</h1>

                    <Input.Root className={style.inputRoot}>
                        <Input.Label title="Nova Senha" />
                        <Input.InputField
                            registerId="password"
                            placeholder="Digite sua Senha"
                            type="password"
                            className={style.input}
                        />
                        <Input.Error className={style.errorMessage} registerId="password" />
                    </Input.Root>

                    <Input.Root className={style.inputRoot}>
                        <Input.Label title="Repetir Nova Senha" />
                        <Input.InputField
                            registerId="repeatPassword"
                            placeholder="Repetir Senha"
                            type="password"
                            className={style.input}
                        />
                        <Input.Error className={style.errorMessage} registerId="repeatPassword" />
                    </Input.Root>

                    <Button className={style.btn} type="submit" disabled={isLoading}>
                        {isLoading ? <div className={style.loader}></div> : 'Atualizar senha'}
                    </Button>
                </form>
            </FormProvider>
        </div>
    )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'

import { fetchAPI } from '@/utils/fetchAPI'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import style from '../styles/module/login-register.module.css'

/* Schema de validação do formulário de login */
const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Campo Obrigatório' })
    .min(1, 'Campo Obrigatório')
    .email('Este campo deve ser um email'),
  password: z
    .string({ required_error: 'Campo Obrigatório' })
    .min(6, 'Mínimo de 6 caracteres')
    .max(72, 'Máximo de 72 caracteres'),
})
type LoginType = z.infer<typeof LoginSchema>

export function LoginView() {
  /* Declaração de variáveis */
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const methods = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: undefined,
      password: undefined,
    },
  })
  const { handleSubmit, setError } = methods

  async function handleLogin(formsData: LoginType) {
    try {
      /* Iniciar estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição para backend */
      const loginResponse = await fetchAPI<{ message?: string }>('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formsData.email,
          password: formsData.password,
        }),
        credentials: 'include',
      })
      const { data } = loginResponse

      /* Captar exceções */
      if (data?.message && data?.message === 'Invalid Credentials') {
        setError('email', { message: 'Email ou senha inválidos' })
        return
      }
      if (!loginResponse.ok) throw new Error('Ocorreu um erro. Tente novamente mais tarde...')

      /* Mensagem de sucesso e redirecionamento para /admin */
      toast.info('Login realizado com sucesso!')
      router.push('/admin')
    } catch (error) {
      console.error(error)
      toast.error('Ocorreu um erro. Tente novamente mais tarde...')
    } finally {
      /* Finalizar estado de carregamento */
      setIsLoading(false)
    }
  }

  return (
    <div className={style.containerAll}>
      <FormProvider {...methods}>
        <form className={style.form} onSubmit={handleSubmit(handleLogin)}>
          <h1 className={style.logo}>COPYEI</h1>

          <Input.Root className={style.inputRoot}>
            <Input.Label title="Email" />
            <Input.InputField registerId="email" placeholder="Digite seu Email" className={style.input} />
            <Input.Error className={style.errorMessage} registerId="email" />
          </Input.Root>

          <Input.Root className={style.inputRoot}>
            <Input.Label title="Senha" />
            <Input.InputField
              registerId="password"
              placeholder="Digite sua Senha"
              type="password"
              className={style.input}
            />
            <Input.Error className={style.errorMessage} registerId="password" />
          </Input.Root>

          <Button className={style.btn} type="submit" disabled={isLoading}>
            {isLoading ? <div className={style.loader}></div> : 'Entrar'}
          </Button>

          <a className={style.link} href="/register">
            Ainda não possui uma conta ?
          </a>
        </form>
      </FormProvider>
    </div>
  )
}

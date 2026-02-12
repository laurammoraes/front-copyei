'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'

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

      /* Fazer requisição via API route do Next.js (same-origin) - garante que o cookie seja setado no domínio correto em produção */
      const res = await fetch('/api/login', {
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
      const data = (await res.json()) as {
        message?: string
        token?: string
        reason?: string
        hint?: string
        detail?: string
      }

      /* Captar exceções */
      if (data?.message && data?.message === 'Invalid Credentials') {
        setError('email', { message: 'Email ou senha inválidos' })
        return
      }
      if (!res.ok) {
        const errMsg =
          data?.reason === 'NO_TOKEN'
            ? 'Backend não retornou token. Verifique se a API retorna copyei_user no cookie ou token no JSON.'
            : data?.reason === 'BACKEND_NON_JSON'
              ? 'Resposta inválida do backend. Verifique a URL da API.'
              : data?.detail || data?.message || 'Ocorreu um erro. Tente novamente mais tarde.'
        throw new Error(errMsg)
      }

      if (data?.token) {
        localStorage.setItem('copyei_token', data.token)
      } else {
        const tokenRes = await fetch('/api/auth/token', { credentials: 'include' })
        const tokenData = (await tokenRes.json()) as { token?: string }
        if (tokenData?.token) localStorage.setItem('copyei_token', tokenData.token)
      }

      toast.info('Login realizado com sucesso!')
      router.push('/admin')
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente mais tarde.'
      toast.error(msg)
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

          <a className={style.link} href="http://v1.copyei.com/copyei">
            Ainda não possui uma conta ?
          </a>

          <a className={style.link} href="/passwordRecovery">
            Esqueceu sua senha?
          </a>
        </form>
      </FormProvider>
    </div>
  )
}

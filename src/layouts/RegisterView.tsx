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

/* Schema de validação do formulário de registro */
const RegisterSchema = z.object({
  name: z.string({ required_error: 'Campo Obrigatório' }).min(4, 'Campo Obrigatório'),
  email: z
    .string({ required_error: 'Campo Obrigatório' })
    .min(1, 'Campo Obrigatório')
    .email('Este campo deve ser um email'),
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
type RegisterType = z.infer<typeof RegisterSchema>

export function RegisterView() {
  /* Declaração de variáveis */
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const methods = useForm<RegisterType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: undefined,
      email: undefined,
      password: undefined,
      repeatPassword: undefined,
    },
  })
  const { handleSubmit, setError } = methods

  async function handleRegister(formsData: RegisterType) {
    toast.info('Página de registro desabilitada temporariamente.')
    return

    /* Validar se as senhas coincidem */
    if (formsData.password !== formsData.repeatPassword) {
      setError('repeatPassword', { message: 'As senhas não coincidem' })
      return
    }

    try {
      /* Iniciar estado de carregamento */
      setIsLoading(true)

      /* Fazer requisição para backend */
      const registerResponse = await fetchAPI<{ message?: string }>('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formsData.name,
          email: formsData.email,
          password: formsData.password,
          repeatPassword: formsData.repeatPassword,
        }),
      })
      const { data } = registerResponse

      /* Captar exceções */
      if (data?.message && data?.message === 'Passwords Do Not Match') {
        setError('repeatPassword', { message: 'As senhas não coincidem' })
        return
      }
      if (data?.message && data?.message === 'Email Already Exists') {
        setError('email', { message: 'Email já existente' })
        return
      }
      if (!registerResponse.ok) throw new Error('Ocorreu um erro. Tente novamente mais tarde...')

      /* Mensagem de sucesso e redirecionamento para /login */
      toast.info('Conta criada com sucesso!')
      router.push('/login')
    } catch (error) {
      toast.error('Ocorreu um erro. Tente novamente mais tarde...')
    } finally {
      /* Finalizar estado de carregamento */
      setIsLoading(false)
    }
  }

  return (
    <div className={style.containerAll}>
      <FormProvider {...methods}>
        <form className={style.form} onSubmit={handleSubmit(handleRegister)}>
          <h1 className={style.logo}>COPYEI</h1>

          <Input.Root className={style.inputRoot}>
            <Input.Label title="Nome" />
            <Input.InputField registerId="name" placeholder="Digite seu Nome" className={style.input} />
            <Input.Error className={style.errorMessage} registerId="name" />
          </Input.Root>

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

          <Input.Root className={style.inputRoot}>
            <Input.Label title="Repetir Senha" />
            <Input.InputField
              registerId="repeatPassword"
              placeholder="Repetir Senha"
              type="password"
              className={style.input}
            />
            <Input.Error className={style.errorMessage} registerId="repeatPassword" />
          </Input.Root>

          <Button className={style.btn} type="submit" disabled={isLoading}>
            {isLoading ? <div className={style.loader}></div> : 'Cadastrar'}
          </Button>

          <a className={style.link} href="/login">
            Já está cadastrado ?
          </a>
        </form>
      </FormProvider>
    </div>
  )
}

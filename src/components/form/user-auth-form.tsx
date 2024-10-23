'use client'

import { AlertCircle, CircuitBoard } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { Icons } from '@/src/components/icons'
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import { cn } from '@/src/lib/utils'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [loginState, setLoginState] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const storedAttempts = localStorage.getItem('loginAttempts')
      const storedLockUntil = localStorage.getItem('lockUntil')
      return {
        attempts: storedAttempts ? parseInt(storedAttempts, 10) : 0,
        lockUntil: storedLockUntil ? parseInt(storedLockUntil, 10) : null
      }
    }
    return { attempts: 0, lockUntil: null }
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  React.useEffect(() => {
    if (loginState.lockUntil && Date.now() < loginState.lockUntil) {
      const remainingTime = Math.ceil((loginState.lockUntil - Date.now()) / 60000)
      setErrorMessage(`Account is locked. Please try again in ${remainingTime} minutes.`)
    } else if (loginState.lockUntil && Date.now() >= loginState.lockUntil) {
      // Reset lock if the time has passed
      setLoginState((prev) => ({ ...prev, lockUntil: null }))
      localStorage.removeItem('lockUntil')
    }
  }, [loginState.lockUntil])

  const isAccountLocked = React.useCallback(() => {
    return loginState.lockUntil !== null && Date.now() < loginState.lockUntil
  }, [loginState.lockUntil])

  const sanitizeInput = (input: string) => {
    return input.replace(/[;&<>"']/g, '')
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    if (isAccountLocked()) {
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData(event.currentTarget)
      const email = sanitizeInput(formData.get('email') as string)
      const password = sanitizeInput(formData.get('password') as string)

      // Check if either field is blank
      if (!email || !password) {
        setErrorMessage('Please fill in both email and password fields.')
        setIsLoading(false)
        return
      }

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (!res?.error) {
        router.push(callbackUrl)
        setLoginState({ attempts: 0, lockUntil: null })
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lockUntil')
      } else {
        const newAttempts = loginState.attempts + 1
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockTime = Date.now() + LOCK_DURATION
          setLoginState({ attempts: newAttempts, lockUntil: lockTime })
          localStorage.setItem('loginAttempts', newAttempts.toString())
          localStorage.setItem('lockUntil', lockTime.toString())
          setErrorMessage(`Too many failed attempts. Account locked for 30 minutes.`)
        } else {
          setLoginState((prev) => ({ ...prev, attempts: newAttempts }))
          localStorage.setItem('loginAttempts', newAttempts.toString())
          setErrorMessage(`Invalid email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`)
        }
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center' {...props}>
      <form onSubmit={onSubmit}>
        <Card className='w-[400px] max-w-[90vw]'>
          <CardHeader>
            <CardTitle className='flex items-center gap-1 text-xl'>
              <CircuitBoard size={20} />
              <span>EE6008</span>
            </CardTitle>
            <CardDescription>Enter your credentials below</CardDescription>
          </CardHeader>
          <CardContent className={cn('grid gap-6', className)}>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  placeholder='example@e.ntu.edu.sg'
                  autoCapitalize='none'
                  autoComplete='email'
                  autoCorrect='off'
                  disabled={isLoading || isAccountLocked()}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input
                  name='password'
                  id='password'
                  placeholder='password'
                  type='password'
                  autoCorrect='off'
                  disabled={isLoading || isAccountLocked()}
                />
              </div>
              {!!errorMessage && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button className='w-full' disabled={isLoading || isAccountLocked()}>
              {isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

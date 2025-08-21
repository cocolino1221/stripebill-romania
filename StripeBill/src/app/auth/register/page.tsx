'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BoltIcon } from '@heroicons/react/24/outline'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setFieldErrors({})
    setSuccessMessage('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage(data.message)
        
        // Auto-login after successful registration
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          })

          if (result?.error) {
            setError('Contul a fost creat, dar autentificarea a eșuat. Încearcă să te autentifici manual.')
          } else {
            router.push('/dashboard')
          }
        }, 1500)
      } else {
        // Handle different error types
        if (data.details) {
          // Field-level errors
          const newFieldErrors: {[key: string]: string} = {}
          if (data.details.name) newFieldErrors.name = data.details.name
          if (data.details.email) newFieldErrors.email = data.details.email
          if (data.details.password) newFieldErrors.password = data.details.password
          setFieldErrors(newFieldErrors)
        }
        
        setError(data.message || 'A apărut o eroare la înregistrare')
      }
    } catch (error) {
      setError('A apărut o eroare de conexiune. Verifică internetul și încearcă din nou.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <BoltIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">StripeBill RO</span>
          </div>
          <CardTitle className="text-2xl">Înregistrare</CardTitle>
          <CardDescription>
            Creează-ți contul și începe să generezi facturi automat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full"
            type="button"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuă cu Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">sau</span>
            </div>
          </div>

          {successMessage && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded border border-green-200">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nume</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nume complet"
                required
              />
              {fieldErrors.name && (
                <p className="text-red-600 text-xs">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
                required
              />
              {fieldErrors.email && (
                <p className="text-red-600 text-xs">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parola</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                minLength={8}
                required
              />
              {fieldErrors.password && (
                <p className="text-red-600 text-xs">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-gray-500">Minim 8 caractere</p>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Se înregistrează...' : 'Înregistrare'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">Ai deja cont? </span>
            <Link href="/auth/login" className="text-primary-600 hover:underline">
              Autentifică-te
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
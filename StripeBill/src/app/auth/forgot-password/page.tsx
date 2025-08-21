'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BoltIcon } from '@heroicons/react/24/outline'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage(data.message)
      } else {
        setError(data.message || 'A apărut o eroare')
      }
    } catch (error) {
      setError('A apărut o eroare de conexiune. Verifică internetul și încearcă din nou.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <BoltIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">StripeBill RO</span>
          </div>
          <CardTitle className="text-2xl">Resetare Parolă</CardTitle>
          <CardDescription>
            Introdu adresa de email pentru a primi instrucțiuni de resetare
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded border border-green-200">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {message}
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
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="email@example.com"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !!message}
            >
              {isLoading ? 'Se trimite...' : message ? 'Email trimis' : 'Trimite Link de Resetare'}
            </Button>
          </form>

          <div className="text-center text-sm space-y-2">
            <div>
              <span className="text-gray-600">Îți amintești parola? </span>
              <Link href="/auth/login" className="text-primary-600 hover:underline">
                Autentifică-te
              </Link>
            </div>
            <div>
              <span className="text-gray-600">Nu ai cont? </span>
              <Link href="/auth/register" className="text-primary-600 hover:underline">
                Înregistrează-te
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BoltIcon, 
  UserCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        await update({ name })
        setIsEditing(false)
        alert('Profilul a fost actualizat cu succes!')
      } else {
        alert('A apărut o eroare la actualizarea profilului')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('A apărut o eroare la actualizarea profilului')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BoltIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">StripeBill RO</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Înapoi la Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCircleIcon className="h-8 w-8 mr-3" />
            Profilul Meu
          </h1>
          <p className="text-gray-600 mt-2">
            Gestionează informațiile contului și setările de securitate
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Informații Profil
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {isEditing ? 'Anulează' : 'Editează'}
                </Button>
              </CardTitle>
              <CardDescription>
                Informațiile de bază ale contului tău
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nume complet
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Numele tău complet"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">
                      {session.user?.name || 'Nu este setat'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 py-2">
                    {session.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Email-ul nu poate fi modificat din motive de securitate
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membru din
                  </label>
                  <p className="text-gray-900 py-2">
                    {new Date().toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Se salvează...' : 'Salvează modificările'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false)
                        setName(session.user?.name || '')
                      }}
                    >
                      Anulează
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistici Cont</CardTitle>
              <CardDescription>
                Un rezumat al activității contului tău
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">0</div>
                  <p className="text-sm text-gray-600">Facturi generate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">3</div>
                  <p className="text-sm text-gray-600">Facturi gratuite rămase</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">Free</div>
                  <p className="text-sm text-gray-600">Plan curent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyIcon className="h-5 w-5 mr-2" />
                Securitate
              </CardTitle>
              <CardDescription>
                Gestionează securitatea contului tău
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Schimbă parola</h4>
                    <p className="text-sm text-gray-600">
                      Actualizează parola contului pentru o securitate sporită
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => alert('Funcționalitatea de schimbare a parolei va fi implementată în curând!')}
                  >
                    Schimbă parola
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sesiuni active</h4>
                    <p className="text-sm text-gray-600">
                      Gestionează dispozitivele conectate la contul tău
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => alert('Funcționalitatea de gestionare a sesiunilor va fi implementată în curând!')}
                  >
                    Vezi sesiuni
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zona Periculoasă</CardTitle>
              <CardDescription>
                Acțiuni ireversibile pentru contul tău
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-800">Deconectare</h4>
                    <p className="text-sm text-red-600">
                      Deconectează-te din contul tău pe acest dispozitiv
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Deconectează-te
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h4 className="font-medium text-red-800">Șterge contul</h4>
                    <p className="text-sm text-red-600">
                      Șterge definitiv contul și toate datele asociate
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => alert('Funcționalitatea de ștergere a contului va fi implementată în curând!')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Șterge contul
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
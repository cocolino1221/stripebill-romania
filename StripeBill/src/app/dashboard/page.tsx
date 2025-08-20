'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BoltIcon, 
  DocumentTextIcon, 
  CreditCardIcon,
  CogIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface UserData {
  id: string
  name: string | null
  email: string
  freeInvoicesUsed: number
  stripeAccountId: string | null
  invoiceProvider: string | null
  subscriptionStatus: string | null
  stripeCustomerId: string | null
  subscriptionCurrentPeriodEnd: string | null
}

interface Invoice {
  id: string
  invoiceNumber: string | null
  customerName: string | null
  totalAmount: number
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        setInvoices(data.invoices)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || !userData) {
    return null
  }

  const freeInvoicesRemaining = Math.max(0, 3 - userData.freeInvoicesUsed)
  const hasWebhookConfigured = !!userData.stripeAccountId // Vom folosi acest câmp pentru a marca dacă webhook-ul e configurat
  const hasInvoiceProvider = !!userData.invoiceProvider
  const isSetupComplete = hasWebhookConfigured && hasInvoiceProvider
  const hasActiveSubscription = userData.subscriptionStatus === 'active'
  const subscriptionEndDate = userData.subscriptionCurrentPeriodEnd 
    ? new Date(userData.subscriptionCurrentPeriodEnd) 
    : null

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
              <span className="text-sm text-gray-600">Bună, {userData.name}!</span>
              <div className="hidden md:flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/invoices')}>
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Facturi
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/settings')}>
                  <CogIcon className="h-4 w-4 mr-2" />
                  Setări
                </Button>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard/profile')}>
                <span className="h-4 w-4 mr-2">👤</span>
                Profil
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Setup Status */}
        {!isSetupComplete && (
          <div className="mb-8">
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">Configurare incompletă</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-amber-700">
                    Pentru a începe să generezi facturi, trebuie să completezi configurarea:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${hasWebhookConfigured ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={hasWebhookConfigured ? 'text-green-700' : 'text-gray-600'}>
                        Webhook Stripe {hasWebhookConfigured && '✓'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${hasInvoiceProvider ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={hasInvoiceProvider ? 'text-green-700' : 'text-gray-600'}>
                        Configurare SmartBill/FGO {hasInvoiceProvider && '✓'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {!hasWebhookConfigured && (
                      <Button 
                        onClick={() => router.push('/dashboard/settings')} 
                        className="w-full"
                      >
                        Configurează Webhook Stripe
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                    {!hasInvoiceProvider && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/dashboard/settings')} 
                        className="w-full"
                      >
                        Configurează SmartBill
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                    {isSetupComplete && (
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/dashboard/settings')} 
                        className="w-full"
                      >
                        Setări avansate
                        <CogIcon className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturi gratuite</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freeInvoicesRemaining}/3</div>
              <p className="text-xs text-muted-foreground">
                {freeInvoicesRemaining > 0 ? 'rămas' : 'folosite toate'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total facturi</CardTitle>
              <DocumentTextIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">generate până acum</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hasActiveSubscription ? 'Pro' : 'Free'}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasActiveSubscription 
                  ? `activ${subscriptionEndDate ? ` până la ${subscriptionEndDate.toLocaleDateString('ro-RO')}` : ''}`
                  : 'upgrade pentru mai multe funcții'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Facturi recente</CardTitle>
              {invoices.length > 0 && (
                <Button variant="outline" onClick={() => router.push('/dashboard/invoices')}>
                  Vezi toate
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nicio factură generată încă
                </h3>
                <p className="text-gray-600 mb-4">
                  {isSetupComplete 
                    ? 'Facturile vor apărea aici automat după plățile Stripe'
                    : 'Completează configurarea pentru a începe'
                  }
                </p>
                {!isSetupComplete && (
                  <Button onClick={() => router.push('/dashboard/settings')}>
                    Configurează acum
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {invoice.invoiceNumber || `Factură #${invoice.id.slice(-8)}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {invoice.customerName || 'Client necunoscut'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {(invoice.totalAmount / 100).toFixed(2)} €
                      </p>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          invoice.status === 'generated' ? 'bg-green-500' :
                          invoice.status === 'pending' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="text-sm capitalize">{invoice.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {!hasActiveSubscription && freeInvoicesRemaining === 0 && (
          <Card className="mt-8 border-primary-200 bg-primary-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-primary-900 mb-2">
                  Ai folosit toate facturile gratuite
                </h3>
                <p className="text-primary-700 mb-4">
                  Upgrade la planul Pro pentru facturi nelimitate și funcții avansate
                </p>
                <Button 
                  className="bg-primary-600 hover:bg-primary-700"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/stripe/create-subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plan: 'pro' })
                      })
                      
                      if (response.ok) {
                        const { url } = await response.json()
                        if (url) window.location.href = url
                      } else {
                        alert('A apărut o eroare la crearea abonamentului')
                      }
                    } catch (error) {
                      console.error('Subscription error:', error)
                      alert('A apărut o eroare la crearea abonamentului')
                    }
                  }}
                >
                  Upgrade la Pro - 29€/lună
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Management */}
        {hasActiveSubscription && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Plan Pro Activ
                </h3>
                <p className="text-green-700 mb-4">
                  Ai acces la facturi nelimitate și toate funcțiile premium
                  {subscriptionEndDate && (
                    <span className="block text-sm mt-1">
                      Se reînnoiește pe {subscriptionEndDate.toLocaleDateString('ro-RO')}
                    </span>
                  )}
                </p>
                <Button 
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-100"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/stripe/customer-portal', {
                        method: 'POST'
                      })
                      
                      if (response.ok) {
                        const { url } = await response.json()
                        if (url) window.location.href = url
                      } else {
                        alert('A apărut o eroare la accesarea portalului')
                      }
                    } catch (error) {
                      console.error('Portal error:', error)
                      alert('A apărut o eroare la accesarea portalului')
                    }
                  }}
                >
                  Gestionează abonamentul
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
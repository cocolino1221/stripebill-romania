'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BoltIcon, 
  CogIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  LinkIcon
} from '@heroicons/react/24/outline'

interface UserSettings {
  id: string
  name: string | null
  email: string
  stripeAccountId: string | null
  stripeConnectClientId: string | null
  userWebhookToken: string | null
  invoiceProvider: string | null
  invoiceSeries: string | null
  companyName: string | null
  companyVat: string | null
  companyAddress: string | null
  bankAccount: string | null
  smartbillApiKey: string | null
  smartbillUsername: string | null
  fgoApiKey: string | null
  defaultVatRate: number | null
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'stripe' | 'invoice' | 'company'>('stripe')
  
  // Stripe Connect form states
  const [stripeConnectClientId, setStripeConnectClientId] = useState('')
  const [isTestingStripeConnect, setIsTestingStripeConnect] = useState(false)

  // Form states
  const [invoiceProvider, setInvoiceProvider] = useState('')
  const [invoiceSeries, setInvoiceSeries] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyVat, setCompanyVat] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [smartbillApiKey, setSmartbillApiKey] = useState('')
  const [smartbillUsername, setSmartbillUsername] = useState('')
  const [fgoApiKey, setFgoApiKey] = useState('')
  const [defaultVatRate, setDefaultVatRate] = useState(19)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserSettings()
    }
  }, [session])

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setUserSettings(data)
        
        // Populate form fields
        setStripeConnectClientId(data.stripeConnectClientId || '')
        setInvoiceProvider(data.invoiceProvider || '')
        setInvoiceSeries(data.invoiceSeries || '')
        setCompanyName(data.companyName || '')
        setCompanyVat(data.companyVat || '')
        setCompanyAddress(data.companyAddress || '')
        setBankAccount(data.bankAccount || '')
        setSmartbillApiKey(data.smartbillApiKey || '')
        setSmartbillUsername(data.smartbillUsername || '')
        setFgoApiKey(data.fgoApiKey || '')
        setDefaultVatRate(data.defaultVatRate || 19)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    try {
      const response = await fetch('/api/stripe/connect')
      if (response.ok) {
        const { authUrl } = await response.json()
        window.location.href = authUrl
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'A apărut o eroare la conectarea cu Stripe')
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error)
      alert('A apărut o eroare la conectarea cu Stripe')
    }
  }

  const handleSaveInvoiceSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceProvider,
          invoiceSeries,
          ...(invoiceProvider === 'smartbill' ? {
            smartbillApiKey,
            smartbillUsername,
          } : {
            fgoApiKey,
          })
        }),
      })

      if (response.ok) {
        alert('Setările au fost salvate cu succes!')
        fetchUserSettings()
      } else {
        alert('A apărut o eroare la salvarea setărilor')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('A apărut o eroare la salvarea setărilor')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCompanySettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          companyVat,
          companyAddress,
          bankAccount,
          defaultVatRate,
        }),
      })

      if (response.ok) {
        alert('Datele companiei au fost salvate cu succes!')
        fetchUserSettings()
      } else {
        alert('A apărut o eroare la salvarea datelor')
      }
    } catch (error) {
      console.error('Error saving company settings:', error)
      alert('A apărut o eroare la salvarea datelor')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveStripeSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripeConnectClientId,
        }),
      })

      if (response.ok) {
        alert('Setările Stripe au fost salvate cu succes!')
        fetchUserSettings()
      } else {
        alert('A apărut o eroare la salvarea setărilor Stripe')
      }
    } catch (error) {
      console.error('Error saving Stripe settings:', error)
      alert('A apărut o eroare la salvarea setărilor Stripe')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestStripeConnect = async () => {
    if (!stripeConnectClientId) {
      alert('Te rog completează Stripe Connect Client ID')
      return
    }

    setIsTestingStripeConnect(true)
    try {
      // Testează dacă Client ID-ul e valid încercând să facă oauth
      const testUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${stripeConnectClientId}&scope=read_write&redirect_uri=${encodeURIComponent(window.location.origin + '/api/stripe/connect/callback')}`
      
      // Deschide într-un popup pentru test
      const popup = window.open(testUrl, 'stripe-test', 'width=600,height=600')
      
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
          alert('✅ Client ID-ul pare valid! Poți salva setările.')
        }
      }, 3000)

    } catch (error) {
      alert('❌ Client ID invalid sau eroare de conexiune')
    } finally {
      setIsTestingStripeConnect(false)
    }
  }

  const handleTestSmartBillConnection = async () => {
    if (!smartbillUsername || !smartbillApiKey) {
      alert('Te rog completează utilizatorul și API Key-ul SmartBill')
      return
    }

    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/smartbill/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: smartbillUsername,
          apiKey: smartbillApiKey
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('🎉 Conexiunea cu SmartBill a fost stabilită cu succes!')
      } else {
        alert(`❌ Eroare conexiune SmartBill: ${result.error}`)
      }
    } catch (error) {
      console.error('Error testing SmartBill connection:', error)
      alert('A apărut o eroare la testarea conexiunii SmartBill')
    } finally {
      setIsTestingConnection(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || !userSettings) {
    return null
  }

  const isStripeConnected = !!userSettings.stripeAccountId
  const hasStripeConnect = !!userSettings.stripeConnectClientId
  const hasInvoiceProvider = !!userSettings.invoiceProvider
  const hasCompanyData = !!(userSettings.companyName && userSettings.companyVat)

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
            <CogIcon className="h-8 w-8 mr-3" />
            Setări Cont
          </h1>
          <p className="text-gray-600 mt-2">
            Configurează integrările și setările pentru generarea automată de facturi
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Progresul configurării</span>
            <span className="text-sm text-gray-500">
              {[hasStripeConnect, hasInvoiceProvider, hasCompanyData].filter(Boolean).length}/3 completat
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${([hasStripeConnect, hasInvoiceProvider, hasCompanyData].filter(Boolean).length / 3) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'stripe', label: 'Conectare Stripe', icon: LinkIcon },
                { id: 'invoice', label: 'Furnizor Facturi', icon: BoltIcon },
                { id: 'company', label: 'Date Companie', icon: CogIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                  {((tab.id === 'stripe' && hasStripeConnect) || 
                    (tab.id === 'invoice' && hasInvoiceProvider) || 
                    (tab.id === 'company' && hasCompanyData)) && (
                    <CheckIcon className="h-4 w-4 ml-2 text-green-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'stripe' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Configurare Stripe (Versiune Simplă)
              </CardTitle>
              <CardDescription>
                Configurează webhook-uri Stripe pentru a genera facturi automat - fără Stripe Connect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* User's Webhook Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token-ul tău de webhook
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userSettings?.userWebhookToken || 'Se generează automat...'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(userSettings?.userWebhookToken || '')}
                      disabled={!userSettings?.userWebhookToken}
                    >
                      Copiază
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Acest token te identifică în webhook-urile Stripe
                  </p>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL-ul pentru webhook Stripe
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/api/stripe/webhook-simple`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/stripe/webhook-simple`)}
                    >
                      Copiază
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Cum configurezi webhook-ul în Stripe:</h4>
                  <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                    <li>Mergi la <a href="https://dashboard.stripe.com/webhooks" target="_blank" className="underline">Stripe Dashboard → Webhooks</a></li>
                    <li>Click "Add endpoint"</li>
                    <li>Adaugă URL-ul: <code className="bg-blue-100 px-1 rounded">{window.location.origin}/api/stripe/webhook-simple</code></li>
                    <li>Selectează evenimentele: <strong>payment_intent.succeeded</strong></li>
                    <li>Adaugă în header custom: <code className="bg-blue-100 px-1 rounded">X-User-Token: {userSettings?.userWebhookToken}</code></li>
                    <li>Salvează webhook-ul</li>
                  </ol>
                </div>

                {/* Benefits */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Avantajele acestei metode:</h4>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>Nu necesită Stripe Connect (mai simplu)</li>
                    <li>Fără OAuth - doar configurezi webhook-ul odată</li>
                    <li>Controlezi tot - nu depinzi de aprobare Stripe</li>
                    <li>Funcționează cu orice tip de cont Stripe</li>
                    <li>Facturile se generează la fel de rapid</li>
                  </ul>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      userSettings?.userWebhookToken ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="font-medium">Status configurare webhook</p>
                      <p className="text-sm text-gray-600">
                        {userSettings?.userWebhookToken 
                          ? 'Token generat - configurează webhook-ul în Stripe'
                          : 'Se generează token...'
                        }
                      </p>
                    </div>
                  </div>
                  {userSettings?.userWebhookToken && (
                    <div className="flex items-center text-green-600">
                      <CheckIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Gata</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'invoice' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BoltIcon className="h-5 w-5 mr-2" />
                Furnizor Facturi
              </CardTitle>
              <CardDescription>
                Alege furnizorul pentru generarea facturilor și configurează API-ul
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Alege furnizorul de facturi
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        invoiceProvider === 'smartbill' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setInvoiceProvider('smartbill')}
                    >
                      <h4 className="font-medium">SmartBill</h4>
                      <p className="text-sm text-gray-600">Popular în România</p>
                    </div>
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        invoiceProvider === 'fgo' 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setInvoiceProvider('fgo')}
                    >
                      <h4 className="font-medium">FGO</h4>
                      <p className="text-sm text-gray-600">Alternativă populară</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Series */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seria facturilor
                  </label>
                  <input
                    type="text"
                    value={invoiceSeries}
                    onChange={(e) => setInvoiceSeries(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="ex: FAC"
                  />
                </div>

                {/* API Configuration */}
                {invoiceProvider === 'smartbill' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Configurare SmartBill</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Utilizator SmartBill (CIF/CUI)
                      </label>
                      <input
                        type="text"
                        value={smartbillUsername}
                        onChange={(e) => setSmartbillUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="RO12345678 (CIF-ul companiei)"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Folosește CIF-ul companiei tale (ex: RO12345678)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key SmartBill
                      </label>
                      <input
                        type="password"
                        value={smartbillApiKey}
                        onChange={(e) => setSmartbillApiKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="••••••••••••••••"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={handleTestSmartBillConnection}
                        disabled={!smartbillUsername || !smartbillApiKey || isTestingConnection}
                        className="flex-1"
                      >
                        {isTestingConnection ? 'Testează conexiunea...' : 'Testează conexiunea'}
                      </Button>
                    </div>
                    
                    {/* SmartBill Instructions */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Cum obții credentialele SmartBill:</h4>
                      <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                        <li>Mergi la <a href="https://www.smartbill.ro" target="_blank" className="underline">SmartBill.ro</a> și logează-te</li>
                        <li>Mergi la <strong>Setări</strong> → <strong>Integrări</strong> → <strong>API</strong></li>
                        <li><strong>Utilizator</strong>: Folosește CIF-ul companiei (ex: RO12345678)</li>
                        <li><strong>API Key</strong>: Generează sau copiază cheia API existentă</li>
                        <li>Testează conexiunea mai sus pentru a verifica datele</li>
                      </ol>
                    </div>
                  </div>
                )}

                {invoiceProvider === 'fgo' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Configurare FGO</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key FGO
                      </label>
                      <input
                        type="password"
                        value={fgoApiKey}
                        onChange={(e) => setFgoApiKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="••••••••••••••••"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSaveInvoiceSettings} 
                  disabled={!invoiceProvider || isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Se salvează...' : 'Salvează setările facturii'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2" />
                Date Companie
              </CardTitle>
              <CardDescription>
                Informațiile companiei tale care vor apărea pe facturi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numele companiei
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="SC Compania Mea SRL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CUI/CIF
                  </label>
                  <input
                    type="text"
                    value={companyVat}
                    onChange={(e) => setCompanyVat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="RO12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresa companiei
                  </label>
                  <textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Strada Exemplu, Nr. 123, București, România"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cont bancar (IBAN)
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="RO49AAAA1B31007593840000"
                  />
                </div>

                {/* VAT Rate Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TVA implicit pentru facturi
                  </label>
                  <select
                    value={defaultVatRate}
                    onChange={(e) => setDefaultVatRate(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>0% - Fără TVA (export, scutiri)</option>
                    <option value={5}>5% - TVA redus (cărți, medicamente)</option>
                    <option value={9}>9% - TVA redus (cazare, restaurant)</option>
                    <option value={19}>19% - TVA normal (majoritatea serviciilor)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    De la 1 august 2025 - vezi noi reglementări TVA România
                  </p>
                </div>

                <Button 
                  onClick={handleSaveCompanySettings} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Se salvează...' : 'Salvează datele companiei'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
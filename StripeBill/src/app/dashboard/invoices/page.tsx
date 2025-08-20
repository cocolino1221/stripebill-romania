'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BoltIcon, 
  DocumentTextIcon,
  ArrowLeftIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface Invoice {
  id: string
  invoiceNumber: string | null
  invoiceSeries: string | null
  customerName: string | null
  customerEmail: string | null
  description: string
  totalAmount: number
  stripeCurrency: string
  status: string
  invoiceDate: string
  createdAt: string
  providerInvoiceUrl: string | null
}

export default function InvoicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'generated' | 'sent' | 'failed'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchInvoices()
    }
  }, [session])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'În procesare' },
      generated: { color: 'bg-green-100 text-green-800', label: 'Generată' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Trimisă' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Eroare' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' || 
      invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDownloadInvoice = (invoice: Invoice) => {
    if (invoice.providerInvoiceUrl) {
      window.open(invoice.providerInvoiceUrl, '_blank')
    } else {
      alert('PDF-ul facturii nu este disponibil încă')
    }
  }

  if (status === 'loading' || isLoading) {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="h-8 w-8 mr-3" />
            Facturile Mele
          </h1>
          <p className="text-gray-600 mt-2">
            Vizualizează și gestionează toate facturile generate din plățile Stripe
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total facturi</p>
                  <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Generate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === 'generated').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">În procesare</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Valoare totală</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(
                      invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
                      invoices[0]?.stripeCurrency || 'eur'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Caută după client, email, număr factură..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="sm:w-48">
                <div className="relative">
                  <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                  >
                    <option value="all">Toate statusurile</option>
                    <option value="pending">În procesare</option>
                    <option value="generated">Generate</option>
                    <option value="sent">Trimise</option>
                    <option value="failed">Erori</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Facturile tale ({filteredInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Nicio factură găsită'
                    : 'Nicio factură generată încă'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Încearcă să modifici filtrele de căutare'
                    : 'Facturile vor apărea aici automat după plățile Stripe'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all') && (
                  <Button onClick={() => router.push('/dashboard/settings')}>
                    Configurează integrările
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {invoice.invoiceNumber 
                              ? `${invoice.invoiceSeries || 'FAC'}-${invoice.invoiceNumber}`
                              : `Factură #${invoice.id.slice(-8)}`
                            }
                          </h4>
                          {getStatusBadge(invoice.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Client:</p>
                            <p>{invoice.customerName || 'Client necunoscut'}</p>
                            {invoice.customerEmail && (
                              <p className="text-xs">{invoice.customerEmail}</p>
                            )}
                          </div>
                          
                          <div>
                            <p className="font-medium">Descriere:</p>
                            <p className="truncate">{invoice.description}</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">Data:</p>
                            <p>{formatDate(invoice.invoiceDate)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatAmount(invoice.totalAmount, invoice.stripeCurrency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(invoice.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement invoice details view
                              alert('Vizualizarea detaliată va fi implementată în curând!')
                            }}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            disabled={!invoice.providerInvoiceUrl}
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
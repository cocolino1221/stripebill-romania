// SmartBill API Integration pentru generarea facturilor românești

interface SmartBillConfig {
  username: string
  apiKey: string
  baseUrl?: string
}

interface SmartBillInvoiceData {
  // Date client
  clientName: string
  clientEmail?: string
  clientAddress?: string
  clientVat?: string
  
  // Date factură
  series: string
  number?: string
  date: string
  dueDate?: string
  
  // Produse/servicii
  products: Array<{
    name: string
    description?: string
    quantity: number
    price: number // în lei (nu cent)
    vatRate: number // TVA: 0, 11, 21 (procente) - 5% și 9% ELIMINATE august 2025
  }>
  
  // Date companie (ale utilizatorului)
  companyName: string
  companyVat: string
  companyAddress: string
  bankAccount?: string
}

interface SmartBillInvoiceResponse {
  success: boolean
  invoiceId?: string
  invoiceNumber?: string
  pdfUrl?: string
  error?: string
}

export class SmartBillAPI {
  private config: SmartBillConfig

  constructor(config: SmartBillConfig) {
    this.config = {
      baseUrl: 'https://ws.smartbill.ro',
      ...config
    }
  }

  // Autentificare cu SmartBill
  private getAuthHeaders() {
    const credentials = Buffer.from(`${this.config.username}:${this.config.apiKey}`).toString('base64')
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  // Testează conexiunea cu SmartBill
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Testăm mai întâi cu o cerere simplă de ping/status
      const testEndpoints = [
        `/SBORO/api/company?cif=${this.config.username}`,
        `/SBORO/api/estimate?cif=${this.config.username}&page=1&pageSize=1`, // endpoint mai simplu
        `/SBORO/api/series?cif=${this.config.username}` // test cu seriile disponibile
      ]

      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
          })

          if (response.ok) {
            const data = await response.json()
            // Dacă primim orice răspuns valid JSON, credentialele sunt corecte
            return { success: true }
          } else if (response.status === 401) {
            // 401 = credentiale greșite
            return {
              success: false,
              error: 'Credentiale invalide. Verifică username-ul (CIF) și API Key-ul.'
            }
          } else if (response.status === 403) {
            // 403 = acces interzis - posibil cont fără acces API
            return {
              success: false,
              error: 'Acces interzis. Verifică că API-ul este activat în contul SmartBill.'
            }
          }
          // Pentru alte statusuri, continuă cu următorul endpoint
        } catch (e) {
          // Pentru erori de rețea, continuă cu următorul endpoint
          continue
        }
      }

      // Dacă toate endpoint-urile au eșuat, încearcă o ultimă verificare simplă
      return {
        success: false,
        error: 'Nu s-a putut conecta la SmartBill. Verifică credentialele și conexiunea la internet.'
      }

    } catch (error) {
      return { 
        success: false, 
        error: `Conexiune eșuată: ${error instanceof Error ? error.message : 'Eroare necunoscută'}` 
      }
    }
  }

  // Generează factură în SmartBill
  async createInvoice(invoiceData: SmartBillInvoiceData): Promise<SmartBillInvoiceResponse> {
    try {
      // Formatează datele pentru SmartBill API
      const smartBillPayload = {
        companyVatCode: invoiceData.companyVat,
        client: {
          name: invoiceData.clientName,
          vatCode: invoiceData.clientVat || '',
          address: invoiceData.clientAddress || '',
          email: invoiceData.clientEmail || ''
        },
        issueDate: invoiceData.date,
        dueDate: invoiceData.dueDate || invoiceData.date,
        seriesName: invoiceData.series,
        number: invoiceData.number,
        products: invoiceData.products.map(product => ({
          name: product.name,
          code: '',
          isService: true,
          measuringUnitName: 'buc',
          currency: 'RON',
          quantity: product.quantity,
          price: product.price,
          isTaxIncluded: false, // Prețul trimis la SmartBill este întotdeauna fără TVA
          taxName: 'TVA',
          taxPercentage: product.vatRate,
          isDiscount: false
        })),
        language: 'RO',
        precision: 2,
        currency: 'RON',
        companyData: {
          name: invoiceData.companyName,
          vatCode: invoiceData.companyVat,
          address: invoiceData.companyAddress,
          iban: invoiceData.bankAccount
        }
      }

      // Trimite cererea la SmartBill
      const response = await fetch(`${this.config.baseUrl}/SBORO/api/invoice`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(smartBillPayload)
      })

      const responseData = await response.json()

      if (response.ok && responseData.number) {
        // Obține PDF-ul facturii
        const pdfUrl = await this.getInvoicePDF(responseData.number, invoiceData.series)
        
        return {
          success: true,
          invoiceId: responseData.number,
          invoiceNumber: `${invoiceData.series}-${responseData.number}`,
          pdfUrl
        }
      } else {
        return {
          success: false,
          error: responseData.errorText || 'Eroare la crearea facturii în SmartBill'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Eroare la generarea facturii: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`
      }
    }
  }

  // Obține PDF-ul unei facturi
  async getInvoicePDF(invoiceNumber: string, series: string): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/SBORO/api/invoice/pdf?cif=${this.config.username}&seriesname=${series}&number=${invoiceNumber}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        // În producție, ar trebui să salvezi PDF-ul în cloud storage
        // și să returnezi URL-ul public
        return `${this.config.baseUrl}/invoice-pdf/${invoiceNumber}` // URL placeholder
      }
      
      return null
    } catch (error) {
      console.error('Error getting invoice PDF:', error)
      return null
    }
  }

  // Trimite factura pe email (prin SmartBill)
  async emailInvoice(invoiceNumber: string, series: string, email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/SBORO/api/invoice/sendmail`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          cif: this.config.username,
          seriesName: series,
          number: invoiceNumber,
          to: email,
          subject: `Factura ${series}-${invoiceNumber}`,
          bodyText: 'Vă mulțumim pentru plată! Găsiți factura atașată.'
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error sending invoice email:', error)
      return false
    }
  }
}

// Helper pentru convertirea sumelor din Stripe (cents) în lei
export function convertStripeCentsToRON(cents: number, currency: string): number {
  if (currency.toLowerCase() === 'eur') {
    // Convertește EUR în RON (rata de schimb aproximativă: 1 EUR = 5 RON)
    // În producție, ar trebui să folosești o API de schimb valutar real
    const eurAmount = cents / 100
    return eurAmount * 5 // 1 EUR ≈ 5 RON
  }
  
  if (currency.toLowerCase() === 'ron') {
    return cents / 100 // RON este deja în cents
  }
  
  // Pentru alte valute, convertește prin EUR
  const eurAmount = cents / 100
  return eurAmount * 5
}

// Helper pentru extragerea datelor din webhook Stripe
export function extractInvoiceDataFromStripePayment(
  paymentIntent: any,
  userSettings: any
): SmartBillInvoiceData {
  const totalAmountRON = convertStripeCentsToRON(paymentIntent.amount, paymentIntent.currency)
  const vatRate = userSettings.defaultVatRate || 21
  
  // Calculează prețul fără TVA dacă Stripe are prețuri cu TVA inclus
  let unitPrice: number
  if (userSettings.stripePricesIncludeVat) {
    // Prețul din Stripe include deja TVA - calculează prețul fără TVA
    unitPrice = totalAmountRON / (1 + vatRate / 100)
  } else {
    // Prețul din Stripe este fără TVA - folosește direct
    unitPrice = totalAmountRON
  }

  return {
    // Date client (din Stripe)
    clientName: paymentIntent.shipping?.name || 'Client fără nume',
    clientEmail: paymentIntent.receipt_email || '',
    clientAddress: paymentIntent.shipping?.address ? 
      `${paymentIntent.shipping.address.line1}, ${paymentIntent.shipping.address.city}, ${paymentIntent.shipping.address.country}` : '',
    
    // Date factură
    series: userSettings.invoiceSeries || 'FAC',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 zile
    
    // Produs/serviciu
    products: [{
      name: paymentIntent.description || 'Serviciu digital',
      description: userSettings.stripePricesIncludeVat 
        ? `Plată cu TVA inclus - Stripe ${paymentIntent.id}` 
        : `Plată fără TVA - Stripe ${paymentIntent.id}`,
      quantity: 1,
      price: unitPrice,
      vatRate: vatRate
    }],
    
    // Date companie (ale utilizatorului)
    companyName: userSettings.companyName || 'Companie SRL',
    companyVat: userSettings.companyVat || 'RO12345678',
    companyAddress: userSettings.companyAddress || 'Adresa companiei',
    bankAccount: userSettings.bankAccount
  }
}
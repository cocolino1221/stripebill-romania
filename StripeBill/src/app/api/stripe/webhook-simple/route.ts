import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SmartBillAPI, extractInvoiceDataFromStripePayment } from '@/lib/smartbill'
import Stripe from 'stripe'

// Webhook simplu fără Stripe Connect - utilizatorul configurează manual webhook-ul
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')
  const userToken = headers().get('x-user-token')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!userToken) {
    console.error('Missing user token in headers')
    return NextResponse.json({ error: 'Missing user token' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Găsește utilizatorul pe baza token-ului
    const user = await prisma.user.findFirst({
      where: { userWebhookToken: userToken },
      select: {
        id: true,
        invoiceProvider: true,
        smartbillApiKey: true,
        smartbillUsername: true,
        fgoApiKey: true,
        invoiceSeries: true,
        companyName: true,
        companyVat: true,
        companyAddress: true,
        bankAccount: true,
        freeInvoicesUsed: true,
        subscriptionStatus: true
      }
    })

    if (!user) {
      console.error(`User not found for webhook token: ${userToken}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Procesează doar evenimentele de plată completă
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      console.log(`Payment received for user ${user.id}:`, paymentIntent.id)

      // Verifică dacă utilizatorul poate genera facturi
      const canGenerateInvoice = user.subscriptionStatus === 'active' || user.freeInvoicesUsed < 3

      if (!canGenerateInvoice) {
        console.log(`User ${user.id} has reached invoice limit and no active subscription`)
        return NextResponse.json({ 
          message: 'Invoice limit reached. Upgrade to Pro for unlimited invoices.' 
        }, { status: 200 })
      }

      // Verifică dacă are configurarea pentru SmartBill
      if (user.invoiceProvider === 'smartbill' && user.smartbillApiKey && user.smartbillUsername) {
        await generateSmartBillInvoice(paymentIntent, user)
      } else if (user.invoiceProvider === 'fgo' && user.fgoApiKey) {
        // TODO: Implementează generarea pentru FGO
        console.log('FGO invoice generation - coming soon!')
      } else {
        console.error(`User ${user.id} missing invoice provider configuration`)
        
        // Salvează plata ca pending pentru configurare ulterioară
        await prisma.invoice.create({
          data: {
            userId: user.id,
            stripePaymentId: paymentIntent.id,
            stripeAmount: paymentIntent.amount,
            stripeCurrency: paymentIntent.currency,
            description: 'Plată primită - configurează furnizorul de facturi',
            quantity: 1,
            unitPrice: paymentIntent.amount,
            totalAmount: paymentIntent.amount,
            status: 'pending',
            errorMessage: 'Furnizorul de facturi nu este configurat'
          }
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Funcție pentru generarea facturii în SmartBill (copiată din webhook-ul principal)
async function generateSmartBillInvoice(paymentIntent: Stripe.PaymentIntent, user: any) {
  try {
    // Configurează SmartBill API
    const smartBill = new SmartBillAPI({
      username: user.smartbillUsername!,
      apiKey: user.smartbillApiKey!
    })

    // Extrage datele pentru factură din plata Stripe
    const invoiceData = extractInvoiceDataFromStripePayment(paymentIntent, user)

    // Generează factura în SmartBill
    const result = await smartBill.createInvoice(invoiceData)

    if (result.success) {
      // Salvează factura în database
      const invoice = await prisma.invoice.create({
        data: {
          userId: user.id,
          stripePaymentId: paymentIntent.id,
          stripeCustomerId: paymentIntent.customer as string || null,
          stripeAmount: paymentIntent.amount,
          stripeCurrency: paymentIntent.currency,
          
          // Date client
          customerName: invoiceData.clientName,
          customerEmail: invoiceData.clientEmail || null,
          customerAddress: invoiceData.clientAddress || null,
          
          // Date factură
          invoiceNumber: result.invoiceId || null,
          invoiceSeries: invoiceData.series,
          description: invoiceData.products[0].name,
          quantity: invoiceData.products[0].quantity,
          unitPrice: Math.round(invoiceData.products[0].price * 100), // convertește în cents
          totalAmount: paymentIntent.amount,
          
          // Provider data
          providerInvoiceId: result.invoiceId || null,
          providerInvoiceUrl: result.pdfUrl || null,
          status: 'generated',
        }
      })

      // Actualizează contorul de facturi gratuite
      if (user.subscriptionStatus !== 'active') {
        await prisma.user.update({
          where: { id: user.id },
          data: { freeInvoicesUsed: { increment: 1 } }
        })
      }

      // Trimite email cu factura (dacă clientul are email)
      if (invoiceData.clientEmail && result.invoiceNumber) {
        const emailSent = await smartBill.emailInvoice(
          result.invoiceId!,
          invoiceData.series,
          invoiceData.clientEmail
        )

        // Actualizează statusul email
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { 
            emailSent,
            status: emailSent ? 'sent' : 'generated'
          }
        })
      }

      console.log(`✅ Invoice generated successfully: ${result.invoiceNumber} for user ${user.id}`)
    } else {
      // Salvează eroarea în database
      await prisma.invoice.create({
        data: {
          userId: user.id,
          stripePaymentId: paymentIntent.id,
          stripeAmount: paymentIntent.amount,
          stripeCurrency: paymentIntent.currency,
          description: 'Eroare la generarea facturii',
          quantity: 1,
          unitPrice: paymentIntent.amount,
          totalAmount: paymentIntent.amount,
          status: 'failed',
          errorMessage: result.error
        }
      })

      console.error(`❌ Invoice generation failed for user ${user.id}:`, result.error)
    }
  } catch (error) {
    console.error('Error in generateSmartBillInvoice:', error)
  }
}
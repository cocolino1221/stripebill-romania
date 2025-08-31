import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SmartBillAPI, extractInvoiceDataFromStripePayment } from '@/lib/smartbill'
import Stripe from 'stripe'
import crypto from 'crypto'

// Funcție pentru generarea facturii în SmartBill
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
      const invoice = await prisma.invoices.create({
        data: {
          id: crypto.randomUUID(),
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
          updatedAt: new Date(),
          
          // Provider data
          providerInvoiceId: result.invoiceId || null,
          providerInvoiceUrl: result.pdfUrl || null,
          status: 'generated',
        }
      })

      // Actualizează contorul de facturi gratuite
      if (user.subscriptionStatus !== 'active') {
        await prisma.users.update({
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
        await prisma.invoices.update({
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
      await prisma.invoices.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          stripePaymentId: paymentIntent.id,
          stripeAmount: paymentIntent.amount,
          stripeCurrency: paymentIntent.currency,
          description: 'Eroare la generarea facturii',
          quantity: 1,
          unitPrice: paymentIntent.amount,
          totalAmount: paymentIntent.amount,
          status: 'failed',
          errorMessage: result.error,
          updatedAt: new Date()
        }
      })

      console.error(`❌ Invoice generation failed for user ${user.id}:`, result.error)
    }
  } catch (error) {
    console.error('Error in generateSmartBillInvoice:', error)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
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
    switch (event.type) {
      // Când se completează o sesiune de checkout (utilizatorul plătește)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.client_reference_id) {
          const userId = session.client_reference_id
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string

          // Actualizează utilizatorul cu datele abonamentului
          await prisma.users.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              subscriptionId: subscriptionId,
              subscriptionStatus: 'active',
            }
          })

          console.log(`Subscription created for user ${userId}`)
        }
        break
      }

      // Când se actualizează un abonament
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.users.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: subscription.status,
            subscriptionPriceId: subscription.items.data[0]?.price.id,
            subscriptionCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          }
        })

        console.log(`Subscription updated for customer ${customerId}`)
        break
      }

      // Când se șterge un abonament
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await prisma.users.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionId: null,
            subscriptionCurrentPeriodEnd: null,
          }
        })

        console.log(`Subscription canceled for customer ${customerId}`)
        break
      }

      // Când plata unui abonament eșuează
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await prisma.users.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: 'past_due',
          }
        })

        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      // Pentru webhook-urile de la conturile conectate (pentru facturile utilizatorilor)
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Verifică dacă este de la un cont conectat
        if (event.account) {
          console.log(`Payment received on connected account ${event.account}:`, paymentIntent.id)
          
          try {
            // Găsește utilizatorul cu stripeAccountId = event.account
            const user = await prisma.users.findFirst({
              where: { stripeAccountId: event.account },
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
              console.error(`User not found for Stripe account: ${event.account}`)
              break
            }

            // Verifică dacă utilizatorul poate genera facturi
            const canGenerateInvoice = user.subscriptionStatus === 'active' || user.freeInvoicesUsed < 3

            if (!canGenerateInvoice) {
              console.log(`User ${user.id} has reached invoice limit and no active subscription`)
              break
            }

            // Verifică dacă are configurarea pentru SmartBill
            if (user.invoiceProvider === 'smartbill' && user.smartbillApiKey && user.smartbillUsername) {
              // Generează factura în SmartBill
              await generateSmartBillInvoice(paymentIntent, user)
            } else if (user.invoiceProvider === 'fgo' && user.fgoApiKey) {
              // TODO: Implementează generarea pentru FGO
              console.log('FGO invoice generation - coming soon!')
            } else {
              console.error(`User ${user.id} missing invoice provider configuration`)
            }

          } catch (error) {
            console.error('Error processing payment for invoice generation:', error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
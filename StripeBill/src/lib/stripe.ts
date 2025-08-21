import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance (pentru abonamente și webhook-uri)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Stripe Connect configuration pentru OAuth cu conturile utilizatorilor
export const stripeConnect = {
  clientId: process.env.STRIPE_CONNECT_CLIENT_ID!,
  authorizeUrl: 'https://connect.stripe.com/oauth/authorize',
  tokenUrl: 'https://connect.stripe.com/oauth/token',
  scope: 'read_write',
  responseType: 'code',
}

// Product IDs pentru abonamente (acestea le vei crea în dashboard-ul tău Stripe)
export const stripePrices = {
  pro: process.env.STRIPE_PRO_PRICE_ID!, // 29€/lună
}

// Helper pentru crearea unei sesiuni Checkout
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  priceId: string
  userId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    allow_promotion_codes: true,
    automatic_tax: {
      enabled: true,
    },
    tax_id_collection: {
      enabled: true,
    },
    metadata: {
      userId,
      plan: 'pro',
    },
  })

  return session
}

// Helper pentru crearea Customer Portal Session
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}
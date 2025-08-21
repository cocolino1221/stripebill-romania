import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, stripePrices } from '@/lib/stripe'

// Creează o sesiune de checkout pentru abonamentul Pro
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { plan = 'pro' } = await req.json()

    // Doar planul Pro este disponibil momentan
    if (plan !== 'pro') {
      return NextResponse.json({ message: 'Invalid plan' }, { status: 400 })
    }

    const priceId = stripePrices[plan as keyof typeof stripePrices]
    if (!priceId) {
      return NextResponse.json({ message: 'Price not configured' }, { status: 400 })
    }

    // URL-urile pentru success și cancel
    const baseUrl = process.env.NEXTAUTH_URL!
    const successUrl = `${baseUrl}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/pricing?canceled=true`

    // Creează sesiunea de checkout
    const checkoutSession = await createCheckoutSession({
      priceId,
      userId: session.user.id,
      userEmail: session.user.email,
      successUrl,
      cancelUrl,
    })

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
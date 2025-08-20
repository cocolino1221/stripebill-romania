import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCustomerPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Creează o sesiune pentru Customer Portal (pentru gestionarea abonamentului)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Găsește utilizatorul cu Stripe Customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        message: 'Nu ai un abonament activ' 
      }, { status: 400 })
    }

    // URL pentru întoarcere
    const returnUrl = `${process.env.NEXTAUTH_URL}/dashboard`

    // Creează sesiunea pentru Customer Portal
    const portalSession = await createCustomerPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    })

    return NextResponse.json({ 
      url: portalSession.url 
    })
  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Generează URL-ul pentru OAuth cu Stripe Connect
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Obține Client ID-ul din baza de date
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { stripeConnectClientId: true }
    })

    if (!user?.stripeConnectClientId) {
      return NextResponse.json({ 
        message: 'Stripe Connect Client ID nu este configurat. Mergi la Settings și configurează-l.' 
      }, { status: 400 })
    }

    // URL-ul pentru redirect după autorizare
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/stripe/connect/callback`
    
    // URL pentru OAuth cu Stripe Connect
    const authUrl = new URL('https://connect.stripe.com/oauth/authorize')
    authUrl.searchParams.set('client_id', user.stripeConnectClientId)
    authUrl.searchParams.set('scope', 'read_write')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', session.user.id) // Pentru a identifica userul

    return NextResponse.json({ 
      authUrl: authUrl.toString() 
    })
  } catch (error) {
    console.error('Stripe Connect OAuth error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
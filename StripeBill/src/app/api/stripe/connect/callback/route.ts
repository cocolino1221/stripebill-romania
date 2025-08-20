import { NextRequest, NextResponse } from 'next/server'
import { stripe, stripeConnect } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

// Callback pentru OAuth cu Stripe Connect
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // user ID
    const error = searchParams.get('error')

    if (error) {
      console.error('Stripe Connect OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=stripe_oauth_error`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_params`
      )
    }

    // Schimbă codul pentru access token
    const tokenResponse = await fetch(stripeConnect.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: process.env.STRIPE_SECRET_KEY!,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { stripe_user_id, access_token } = tokenData

    // Salvează datele în database
    await prisma.user.update({
      where: { id: state },
      data: {
        stripeAccountId: stripe_user_id,
        stripeAccessToken: access_token,
      },
    })

    // Redirect înapoi la setări cu success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?stripe_connected=true`
    )
  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard/settings?error=connection_failed`
    )
  }
}
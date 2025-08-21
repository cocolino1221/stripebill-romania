import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Dashboard API - session:', session ? 'exists' : 'null')
    console.log('Dashboard API - user ID:', session?.user?.id)
    console.log('Dashboard API - user email:', session?.user?.email)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'No session found' }, { status: 401 })
    }
    
    // If we don't have user ID but we have email, try to find user
    let userId = session.user.id
    if (!userId && session.user.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        if (dbUser) {
          userId = dbUser.id
          console.log('Found user by email:', userId)
        }
      } catch (error) {
        console.error('Error finding user by email:', error)
      }
    }
    
    if (!userId) {
      return NextResponse.json({ message: 'User ID not found' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        freeInvoicesUsed: true,
        stripeAccountId: true,
        invoiceProvider: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        subscriptionCurrentPeriodEnd: true,
      }
    })

    if (!user) {
      // If user doesn't exist, create them (for OAuth users)
      if (session.user.email) {
        const newUser = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || 'Utilizator',
            // OAuth users don't need password
          }
        })
        
        return NextResponse.json({
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            freeInvoicesUsed: newUser.freeInvoicesUsed,
            stripeAccountId: newUser.stripeAccountId,
            invoiceProvider: newUser.invoiceProvider,
            subscriptionStatus: newUser.subscriptionStatus,
            stripeCustomerId: newUser.stripeCustomerId,
            subscriptionCurrentPeriodEnd: null,
          },
          invoices: []
        })
      }
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: userId },
      select: {
        id: true,
        invoiceNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({
      user: {
        ...user,
        subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd?.toISOString() || null,
      },
      invoices: invoices.map(invoice => ({
        ...invoice,
        createdAt: invoice.createdAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
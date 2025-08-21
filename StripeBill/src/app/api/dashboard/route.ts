import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
      where: { userId: session.user.id },
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
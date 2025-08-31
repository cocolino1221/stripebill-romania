import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Dashboard API - session exists:', !!session)
    console.log('Dashboard API - user exists:', !!session?.user)
    console.log('Dashboard API - user ID:', session?.user?.id || 'missing')
    console.log('Dashboard API - user email:', session?.user?.email || 'missing')
    
    if (!session?.user) {
      console.log('Dashboard API - No session or user found')
      return NextResponse.json({ 
        message: 'No session found',
        debug: {
          hasSession: !!session,
          hasUser: !!session?.user
        }
      }, { status: 401 })
    }
    
    // If we don't have user ID but we have email, try to find user
    let userId = session.user.id
    if (!userId && session.user.email) {
      console.log('Dashboard API - Trying to find user by email:', session.user.email)
      try {
        const dbUser = await prisma.users.findUnique({
          where: { email: session.user.email }
        })
        if (dbUser) {
          userId = dbUser.id
          console.log('Dashboard API - Found user by email:', userId)
        } else {
          console.log('Dashboard API - No user found with email:', session.user.email)
        }
      } catch (error) {
        console.error('Dashboard API - Error finding user by email:', error)
        // Continue without failing, we'll create user below
      }
    }
    
    if (!userId) {
      console.log('Dashboard API - No user ID available, cannot proceed')
      return NextResponse.json({ 
        message: 'User ID not found',
        debug: {
          sessionUserId: session?.user?.id || 'missing',
          sessionUserEmail: session?.user?.email || 'missing'
        }
      }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
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
        const newUser = await prisma.users.create({
          data: {
            id: crypto.randomUUID(),
            email: session.user.email,
            name: session.user.name || 'Utilizator',
            createdAt: new Date(),
            updatedAt: new Date(),
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

    const invoices = await prisma.invoices.findMany({
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Try to provide more specific error information
    let errorMessage = 'Internal server error'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = error.stack || error.message
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
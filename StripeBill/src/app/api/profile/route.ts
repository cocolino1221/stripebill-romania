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

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        freeInvoicesUsed: true,
        subscriptionStatus: true,
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      totalInvoices: user._count.invoices
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { message: 'Numele trebuie să aibă cel puțin 2 caractere' },
        { status: 400 }
      )
    }

    const user = await prisma.users.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        freeInvoicesUsed: true,
        subscriptionStatus: true,
        _count: {
          select: {
            invoices: true
          }
        }
      }
    })

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      totalInvoices: user._count.invoices
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
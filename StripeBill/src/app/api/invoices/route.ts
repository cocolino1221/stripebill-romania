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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [invoices, totalCount] = await Promise.all([
      prisma.invoices.findMany({
        where,
        select: {
          id: true,
          invoiceNumber: true,
          invoiceSeries: true,
          customerName: true,
          customerEmail: true,
          description: true,
          totalAmount: true,
          stripeCurrency: true,
          status: true,
          invoiceDate: true,
          createdAt: true,
          providerInvoiceUrl: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoices.count({ where })
    ])

    return NextResponse.json({
      invoices: invoices.map(invoice => ({
        ...invoice,
        invoiceDate: invoice.invoiceDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: skip + limit < totalCount,
        hasPrevPage: page > 1
      }
    })
  } catch (error) {
    console.error('Invoices API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// For simplified response (just the invoices array)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await prisma.invoices.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceSeries: true,
        customerName: true,
        customerEmail: true,
        description: true,
        totalAmount: true,
        stripeCurrency: true,
        status: true,
        invoiceDate: true,
        createdAt: true,
        providerInvoiceUrl: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      invoices.map(invoice => ({
        ...invoice,
        invoiceDate: invoice.invoiceDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error('Invoices simple API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
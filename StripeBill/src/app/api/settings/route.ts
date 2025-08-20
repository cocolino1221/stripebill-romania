import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        stripeAccountId: true,
        stripeConnectClientId: true,
        userWebhookToken: true,
        invoiceProvider: true,
        invoiceSeries: true,
        companyName: true,
        companyVat: true,
        companyAddress: true,
        bankAccount: true,
        smartbillApiKey: true,
        smartbillUsername: true,
        fgoApiKey: true,
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Generează webhook token dacă nu există
    if (!user.userWebhookToken) {
      const webhookToken = randomBytes(32).toString('hex')
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { userWebhookToken: webhookToken },
        select: {
          id: true,
          name: true,
          email: true,
          stripeAccountId: true,
          stripeConnectClientId: true,
          userWebhookToken: true,
          invoiceProvider: true,
          invoiceSeries: true,
          companyName: true,
          companyVat: true,
          companyAddress: true,
          bankAccount: true,
          smartbillApiKey: true,
          smartbillUsername: true,
          fgoApiKey: true,
        }
      })
    }

    // Don't return sensitive API keys in their full form
    return NextResponse.json({
      ...user,
      smartbillApiKey: user.smartbillApiKey ? '••••••••' + user.smartbillApiKey.slice(-4) : null,
      fgoApiKey: user.fgoApiKey ? '••••••••' + user.fgoApiKey.slice(-4) : null,
    })
  } catch (error) {
    console.error('Settings GET error:', error)
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
    const {
      stripeConnectClientId,
      invoiceProvider,
      invoiceSeries,
      companyName,
      companyVat,
      companyAddress,
      bankAccount,
      smartbillApiKey,
      smartbillUsername,
      fgoApiKey,
    } = body

    // Build update object based on provided fields
    const updateData: any = {}

    if (stripeConnectClientId !== undefined) updateData.stripeConnectClientId = stripeConnectClientId
    if (invoiceProvider !== undefined) updateData.invoiceProvider = invoiceProvider
    if (invoiceSeries !== undefined) updateData.invoiceSeries = invoiceSeries
    if (companyName !== undefined) updateData.companyName = companyName
    if (companyVat !== undefined) updateData.companyVat = companyVat
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount
    if (smartbillApiKey !== undefined) updateData.smartbillApiKey = smartbillApiKey
    if (smartbillUsername !== undefined) updateData.smartbillUsername = smartbillUsername
    if (fgoApiKey !== undefined) updateData.fgoApiKey = fgoApiKey

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        stripeAccountId: true,
        stripeConnectClientId: true,
        userWebhookToken: true,
        invoiceProvider: true,
        invoiceSeries: true,
        companyName: true,
        companyVat: true,
        companyAddress: true,
        bankAccount: true,
        smartbillApiKey: true,
        smartbillUsername: true,
        fgoApiKey: true,
      }
    })

    // Don't return sensitive API keys in their full form
    return NextResponse.json({
      ...user,
      smartbillApiKey: user.smartbillApiKey ? '••••••••' + user.smartbillApiKey.slice(-4) : null,
      fgoApiKey: user.fgoApiKey ? '••••••••' + user.fgoApiKey.slice(-4) : null,
    })
  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
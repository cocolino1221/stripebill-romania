import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SmartBillAPI } from '@/lib/smartbill'

// Testează conexiunea cu SmartBill
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nu ești autentificat' }, { status: 401 })
    }

    const { username, apiKey } = await req.json()

    if (!username || !apiKey) {
      return NextResponse.json({ 
        error: 'Username și API key sunt necesare' 
      }, { status: 400 })
    }

    // Testează conexiunea
    const smartBill = new SmartBillAPI({
      username,
      apiKey
    })

    const testResult = await smartBill.testConnection()

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Conexiunea cu SmartBill a fost stabilită cu succes!'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing SmartBill connection:', error)
    return NextResponse.json({
      success: false,
      error: 'Eroare la testarea conexiunii SmartBill'
    }, { status: 500 })
  }
}
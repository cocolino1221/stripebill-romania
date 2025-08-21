import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Test basic database connectivity
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Test user table access
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'Database connection working',
      testQuery: result,
      userCount: userCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  }

  // Test 1: Environment variables
  results.tests.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  // Test 2: Prisma connection
  try {
    await prisma.$connect()
    const userCount = await prisma.users.count()
    results.tests.prisma = {
      status: 'success',
      userCount,
      connected: true
    }
    await prisma.$disconnect()
  } catch (error) {
    results.tests.prisma = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    }
  }

  // Test 3: Raw database URL parsing
  try {
    const dbUrl = process.env.DATABASE_URL
    if (dbUrl) {
      const url = new URL(dbUrl)
      results.tests.dbUrl = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        database: url.pathname.replace('/', ''),
        username: url.username,
        hasPassword: !!url.password
      }
    }
  } catch (error) {
    results.tests.dbUrl = {
      error: error instanceof Error ? error.message : 'Invalid URL'
    }
  }

  return NextResponse.json(results)
}
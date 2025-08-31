import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    let dbUser = null
    let dbError = null
    
    if (session?.user?.email) {
      try {
        dbUser = await prisma.users.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        })
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown database error'
      }
    }
    
    return NextResponse.json({
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      hasUser: !!session?.user,
      userKeys: session?.user ? Object.keys(session.user) : [],
      userId: session?.user?.id || 'missing',
      userEmail: session?.user?.email || 'missing',
      userName: session?.user?.name || 'missing',
      userImage: session?.user?.image || 'missing',
      dbUser: dbUser,
      dbError: dbError,
      databaseWorking: !dbError && dbUser !== undefined
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({
      error: 'Session debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    console.log('Test register starting...')
    
    // Test database connection
    const dbTest = await prisma.users.count()
    console.log('Database connection OK, user count:', dbTest)
    
    // Create test user
    const testEmail = `test-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('test123456', 12)
    
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })
    
    console.log('User created successfully:', user.id)
    
    return NextResponse.json({
      success: true,
      message: 'Test registration successful',
      userId: user.id,
      email: user.email
    })
    
  } catch (error: any) {
    console.error('Test register error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
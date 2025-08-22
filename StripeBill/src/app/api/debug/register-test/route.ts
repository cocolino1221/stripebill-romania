import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    console.log('Register test starting...')
    
    // Test database connection first
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection test:', testQuery)
    
    // Test user table access
    const userCount = await prisma.user.count()
    console.log('Current user count:', userCount)
    
    // Parse request body
    const body = await req.json()
    const { name, email, password } = body
    console.log('Request data:', { name, email: email || 'missing', hasPassword: !!password })
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: { name: !!name, email: !!email, password: !!password }
      }, { status: 400 })
    }
    
    // Check for existing user
    console.log('Checking for existing user...')
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    console.log('Existing user found:', !!existingUser)
    
    if (existingUser) {
      return NextResponse.json({
        error: 'User already exists',
        userId: existingUser.id
      }, { status: 409 })
    }
    
    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully')
    
    // Create user
    console.log('Creating user in database...')
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
      }
    })
    console.log('User created successfully:', { id: user.id, email: user.email })
    
    return NextResponse.json({
      success: true,
      message: 'Test registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })
    
  } catch (error: any) {
    console.error('Register test error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    return NextResponse.json({
      error: 'Registration test failed',
      details: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
      }
    }, { status: 500 })
  }
}
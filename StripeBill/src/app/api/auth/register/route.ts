import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Detailed validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          error: 'MISSING_FIELDS',
          message: 'Toate câmpurile sunt obligatorii',
          details: {
            name: !name ? 'Numele este obligatoriu' : null,
            email: !email ? 'Email-ul este obligatoriu' : null,
            password: !password ? 'Parola este obligatorie' : null
          }
        },
        { status: 400 }
      )
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'INVALID_EMAIL',
          message: 'Formatul email-ului nu este valid' 
        },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: 'WEAK_PASSWORD',
          message: 'Parola trebuie să aibă cel puțin 8 caractere' 
        },
        { status: 400 }
      )
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'USER_EXISTS',
          message: 'Un utilizator cu acest email există deja' 
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
      }
    })

    console.log(`New user registered: ${user.email} (ID: ${user.id})`)

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(user.email, user.name || 'Utilizator')
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Contul a fost creat cu succes! Te poți autentifica acum.',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Register error:', error)

    // Database connection errors
    if (error.code === 'P1001') {
      return NextResponse.json(
        { 
          error: 'DATABASE_CONNECTION',
          message: 'Eroare de conexiune la baza de date. Încearcă din nou.' 
        },
        { status: 503 }
      )
    }

    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'USER_EXISTS',
          message: 'Un utilizator cu acest email există deja' 
        },
        { status: 409 }
      )
    }

    // Generic error
    return NextResponse.json(
      { 
        error: 'REGISTRATION_FAILED',
        message: 'A apărut o eroare la înregistrare. Încearcă din nou.' 
      },
      { status: 500 }
    )
  }
}
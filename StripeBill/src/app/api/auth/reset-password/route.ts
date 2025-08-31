import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { 
          error: 'MISSING_FIELDS',
          message: 'Token-ul și parola sunt obligatorii' 
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

    // Find user with valid reset token
    const user = await prisma.users.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date() // Token not expired
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { 
          error: 'INVALID_TOKEN',
          message: 'Token-ul de resetare este invalid sau a expirat' 
        },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    console.log(`Password reset successful for user: ${user.email}`)

    return NextResponse.json(
      { 
        success: true,
        message: 'Parola a fost resetată cu succes! Te poți autentifica cu noua parolă.' 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Reset password error:', error)
    
    return NextResponse.json(
      { 
        error: 'RESET_PASSWORD_FAILED',
        message: 'A apărut o eroare la resetarea parolei. Te rugăm să încerci din nou.' 
      },
      { status: 500 }
    )
  }
}
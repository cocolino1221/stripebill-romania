import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Validate email
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'INVALID_EMAIL',
          message: 'Te rugăm să introduci o adresă de email validă' 
        },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { 
          success: true,
          message: 'Dacă există un cont cu această adresă de email, vei primi instrucțiuni pentru resetarea parolei.' 
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    
    try {
      await sendPasswordResetEmail(user.email, user.name || 'Utilizator', resetUrl)
      console.log(`Password reset email sent to: ${user.email}`)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Continue anyway - don't expose email service issues
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Dacă există un cont cu această adresă de email, vei primi instrucțiuni pentru resetarea parolei.' 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    return NextResponse.json(
      { 
        error: 'FORGOT_PASSWORD_FAILED',
        message: 'A apărut o eroare. Te rugăm să încerci din nou.' 
      },
      { status: 500 }
    )
  }
}
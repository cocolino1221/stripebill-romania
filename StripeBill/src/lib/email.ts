// Email service using Resend (free tier: 3,000 emails/month)
// Alternative: SendGrid, NodeMailer with Gmail, or any SMTP service

interface EmailConfig {
  from: string
  apiKey?: string
  service: 'resend' | 'console' // 'console' for development
}

const emailConfig: EmailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@stripebill-romania.vercel.app',
  apiKey: process.env.RESEND_API_KEY,
  service: process.env.EMAIL_SERVICE as any || 'console'
}

// Send password reset email
export async function sendPasswordResetEmail(
  to: string, 
  name: string, 
  resetUrl: string
): Promise<void> {
  const subject = '🔐 Resetare parolă - StripeBill România'
  const html = generatePasswordResetHtml(name, resetUrl)
  const text = generatePasswordResetText(name, resetUrl)

  await sendEmail({
    to,
    subject,
    html,
    text
  })
}

// Send welcome email
export async function sendWelcomeEmail(
  to: string, 
  name: string
): Promise<void> {
  const subject = '🎉 Bun venit la StripeBill România!'
  const html = generateWelcomeHtml(name)
  const text = generateWelcomeText(name)

  await sendEmail({
    to,
    subject,
    html,
    text
  })
}

// Generic send email function
async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<void> {
  if (emailConfig.service === 'console') {
    // Development mode - log to console
    console.log('📧 EMAIL (Development Mode)')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Text:', text)
    console.log('HTML:', html)
    return
  }

  if (emailConfig.service === 'resend' && emailConfig.apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailConfig.from,
          to: [to],
          subject,
          html,
          text
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${response.status} - ${error}`)
      }

      const result = await response.json()
      console.log('📧 Email sent successfully via Resend:', result.id)
    } catch (error) {
      console.error('📧 Failed to send email via Resend:', error)
      throw error
    }
  } else {
    console.log('📧 Email service not configured - email not sent')
    console.log('To:', to)
    console.log('Subject:', subject)
  }
}

// HTML template for password reset
function generatePasswordResetHtml(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Resetare Parolă</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
            .warning { background: #fef3cd; border: 1px solid #fbbf24; border-radius: 6px; padding: 16px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🔐 StripeBill România</div>
        </div>
        
        <h2>Salut ${name || 'Utilizator'}!</h2>
        
        <p>Am primit o cerere pentru resetarea parolei contului tău StripeBill România.</p>
        
        <p>Pentru a reseta parola, dă clic pe butonul de mai jos:</p>
        
        <a href="${resetUrl}" class="button">Resetează Parola</a>
        
        <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
                <li>Acest link va expira în <strong>1 oră</strong></li>
                <li>Poți folosi acest link doar o singură dată</li>
                <li>Dacă nu ai cerut resetarea parolei, poți ignora acest email</li>
            </ul>
        </div>
        
        <p>Dacă butonul nu funcționează, copiază și lipește următorul link în browser:</p>
        <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
        
        <div class="footer">
            <p>Acest email a fost trimis automat de StripeBill România.</p>
            <p>Dacă ai întrebări, ne poți contacta la support@stripebill-romania.com</p>
        </div>
    </body>
    </html>
  `
}

// Text template for password reset
function generatePasswordResetText(name: string, resetUrl: string): string {
  return `
Salut ${name || 'Utilizator'}!

Am primit o cerere pentru resetarea parolei contului tău StripeBill România.

Pentru a reseta parola, accesează următorul link:
${resetUrl}

IMPORTANT:
- Acest link va expira în 1 oră
- Poți folosi acest link doar o singură dată
- Dacă nu ai cerut resetarea parolei, poți ignora acest email

Dacă ai întrebări, ne poți contacta la support@stripebill-romania.com

StripeBill România
  `
}

// HTML template for welcome email
function generateWelcomeHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bun venit!</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .features { background: #f8fafc; border-radius: 6px; padding: 20px; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">🎉 StripeBill România</div>
        </div>
        
        <h2>Bun venit, ${name || 'Utilizator'}!</h2>
        
        <p>Îți mulțumim că te-ai înregistrat la StripeBill România - soluția ta pentru automatizarea facturilor!</p>
        
        <div class="features">
            <h3>🚀 Ce poți face acum:</h3>
            <ul>
                <li><strong>Conectează Stripe</strong> - Primește plăți de la clienți</li>
                <li><strong>Configurează SmartBill</strong> - Generează facturi conforme fiscal</li>
                <li><strong>Automatizare completă</strong> - Fără intervenție manuală</li>
                <li><strong>3 facturi gratuite</strong> - Pentru a testa sistemul</li>
            </ul>
        </div>
        
        <p>Să începem configurarea contului tău:</p>
        
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Accesează Dashboard-ul</a>
        
        <p>Dacă ai întrebări sau ai nevoie de ajutor, suntem aici pentru tine!</p>
        
        <div class="footer">
            <p>Cu drag,<br>Echipa StripeBill România</p>
            <p>Pentru suport: support@stripebill-romania.com</p>
        </div>
    </body>
    </html>
  `
}

// Text template for welcome email
function generateWelcomeText(name: string): string {
  return `
Bun venit, ${name || 'Utilizator'}!

Îți mulțumim că te-ai înregistrat la StripeBill România - soluția ta pentru automatizarea facturilor!

Ce poți face acum:
✓ Conectează Stripe - Primește plăți de la clienți
✓ Configurează SmartBill - Generează facturi conforme fiscal  
✓ Automatizare completă - Fără intervenție manuală
✓ 3 facturi gratuite - Pentru a testa sistemul

Accesează dashboard-ul: ${process.env.NEXTAUTH_URL}/dashboard

Dacă ai întrebări sau ai nevoie de ajutor, suntem aici pentru tine!

Cu drag,
Echipa StripeBill România
support@stripebill-romania.com
  `
}
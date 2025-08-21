import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Temporarily disable adapter for OAuth issues
  // adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            }
          })

          if (!user || !user.password) {
            console.log('User not found or no password')
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log('Invalid password')
            return null
          }

          console.log('User authenticated successfully:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // For OAuth providers, ensure user exists in our database
        if (account && account.provider === 'google' && user.email) {
          try {
            let dbUser = await prisma.user.findUnique({
              where: { email: user.email }
            })
            
            if (!dbUser) {
              dbUser = await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || 'Utilizator Google',
                  image: user.image || null
                }
              })
              console.log('Created Google user:', dbUser.email)
            }
            
            return {
              ...token,
              id: dbUser.id,
            }
          } catch (error) {
            console.error('Error handling Google user:', error)
          }
        }
        
        return {
          ...token,
          id: user.id,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        }
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback - url:', url, 'baseUrl:', baseUrl)
      // Redirect to dashboard after successful login
      if (url.includes('/api/auth/signin') || url.includes('/auth/login')) {
        return `${baseUrl}/dashboard`
      }
      // Allow relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
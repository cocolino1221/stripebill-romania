import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

          const user = await prisma.users.findUnique({
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
      console.log('JWT callback - user:', user ? 'exists' : 'null', 'account:', account?.provider)
      
      if (user) {
        // For OAuth providers, ensure user exists in our database
        if (account && account.provider === 'google' && user.email) {
          try {
            let dbUser = await prisma.users.findUnique({
              where: { email: user.email }
            })
            
            if (!dbUser) {
              dbUser = await prisma.users.create({
                data: {
                  id: crypto.randomUUID(),
                  email: user.email,
                  name: user.name || 'Utilizator Google',
                  image: user.image || null,
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              })
              console.log('Created Google user:', dbUser.email, 'ID:', dbUser.id)
            } else {
              console.log('Found existing Google user:', dbUser.email, 'ID:', dbUser.id)
            }
            
            return {
              ...token,
              id: dbUser.id,
              email: user.email,
            }
          } catch (error) {
            console.error('Error handling Google user:', error)
            return {
              ...token,
              id: user.id || 'temp-id',
              email: user.email,
            }
          }
        }
        
        return {
          ...token,
          id: user.id,
          email: user.email,
        }
      }
      
      // For existing sessions, try to get user ID from database if missing
      if (token.email && !token.id) {
        try {
          const dbUser = await prisma.users.findUnique({
            where: { email: token.email as string }
          })
          if (dbUser) {
            token.id = dbUser.id
            console.log('Found user ID for existing session:', dbUser.id)
          }
        } catch (error) {
          console.error('Error finding user in JWT callback:', error)
        }
      }
      
      console.log('JWT callback final token ID:', token.id)
      return token
    },
    async session({ session, token }) {
      console.log('Session callback - token ID:', token.id, 'email:', token.email)
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
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
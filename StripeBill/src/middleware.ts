import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    console.log('Middleware - token:', !!req.nextauth.token)
    console.log('Middleware - path:', req.nextUrl.pathname)
    
    // Allow the request to continue for authenticated users
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Authorized callback - token:', !!token)
        console.log('Authorized callback - path:', req.nextUrl.pathname)
        return !!token
      }
    },
  }
)

// Protect dashboard routes but exclude NextAuth API routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard/:path*',
    '/api/settings/:path*',
    '/api/invoices/:path*',
    '/api/profile/:path*'
  ]
}
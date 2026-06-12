/**
 * Next.js Proxy for Authentication and Authorization
 * 
 * Requirements:
 * - 1 (Authentication required for protected routes)
 * - 11 (Admin dashboard access control)
 * 
 * Proxy runs on all routes and checks authentication status.
 * Redirects unauthenticated users to /login and non-admins away from /admin routes.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/public-matches', '/public-leaderboard']

// Define admin routes that require admin role
const ADMIN_ROUTES = ['/admin']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes without authentication check
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Get auth token from cookies
  const authToken = request.cookies.get('supabase-auth-token')

  // If no auth token, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Create Supabase client to verify token and get user
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${authToken.value}`
        }
      }
    }
  )

  try {
    // Verify the token is valid by getting the user
    const { data: { user }, error } = await supabase.auth.getUser(authToken.value)

    if (error || !user) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      // Clear invalid token
      response.cookies.delete('supabase-auth-token')
      return response
    }

    // Check if trying to access admin routes
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
    
    if (isAdminRoute) {
      // Fetch user's profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        // Non-admin trying to access admin route, redirect to /matches
        const matchesUrl = new URL('/matches', request.url)
        return NextResponse.redirect(matchesUrl)
      }
    }

    // User is authenticated and authorized, proceed
    return NextResponse.next()

  } catch (error) {
    console.error('Proxy error:', error)
    // On error, redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

// Configure which routes the proxy should run on
// NOTE: This file is named proxy.ts not middleware.ts, so it should NOT run
// If you want to enable this middleware, rename this file to middleware.ts
export const config = {
  matcher: [
    // API routes should NEVER be matched by middleware
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

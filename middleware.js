/**
 * Supabase Auth middleware for Next.js
 * 
 * Handles session token refresh and role-based route protection
 * Updates the auth token in cookies and passes it to Server Components
 * 
 * @author [Your Name]
 * @version 1.1.0
 */

import { NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// Define routes that require authentication and role-specific access
const protectedRoutes = [
  '/dashboard/student',
  '/dashboard/admin',
  '/dashboard/superadmin',
]

const studentRoutes = ['/student']
const adminRoutes = ['/admin']
const superAdminRoutes = ['/superadmin']

// Static files and public routes that should bypass auth
const publicPaths = [
  '/_next',
  '/static',
  '/api/public',
  '/favicon.ico',
  '/auth/login',
  '/auth/signup',
]

/**
 * Creates a Supabase client for middleware use
 * @param {Object} cookies - Request cookies object
 * @returns {SupabaseClient} Configured Supabase client
 */
const createClient = (cookies) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: () => {}, // No-op in middleware
        remove: () => {}, // No-op in middleware
      },
      auth: {
        detectSessionInUrl: false,
        persistSession: false,
      }
    }
  )
}

/**
 * Check if a path should bypass authentication
 * @param {string} path - Request path to check
 * @returns {boolean} Whether path should bypass auth
 */
const isPublicPath = (path) => {
  return publicPaths.some(publicPath => path.startsWith(publicPath))
}

/**
 * Middleware function executed on each request
 * @param {Request} request - Incoming request object
 */
export async function middleware(request) {
  try {
    const { pathname } = request.nextUrl

    // Skip auth check for public paths
    if (isPublicPath(pathname)) {
      return NextResponse.next()
    }

    // Update session if it exists
    const response = await updateSession(request)

    // For non-protected routes, just return the response with updated session
    if (!protectedRoutes.some(route => pathname.startsWith(route)) && 
        !studentRoutes.some(route => pathname.startsWith(route)) && 
        !adminRoutes.some(route => pathname.startsWith(route)) && 
        !superAdminRoutes.some(route => pathname.startsWith(route))) {
      return response
    }

    // For protected routes, check authentication
    const supabase = createClient(request.cookies)
    
    // Use getUser() instead of getSession() for better security
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // First get the user's email from auth.users
    const userEmail = user.email

    // Then find the corresponding user in public.users table using the email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('email', userEmail)
      .single()

    if (userError) {
      console.error('Error fetching user role:', userError)
      console.error('User email:', userEmail)
      console.error('Error details:', userError.message, userError.details)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const roleId = userData?.role_id

    // Validate role_id exists
    if (roleId === undefined || roleId === null) {
      console.error('Invalid role_id for user:', userEmail)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Handle role-specific route protection with early returns
    if (studentRoutes.some(route => pathname.startsWith(route)) && roleId !== 3) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (adminRoutes.some(route => pathname.startsWith(route)) && roleId !== 2 && roleId !== 1) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (superAdminRoutes.some(route => pathname.startsWith(route)) && roleId !== 1) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    console.error('Error stack:', error.stack)
    console.error('Request path:', request.nextUrl.pathname)
    
    const { pathname } = request.nextUrl
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.next()
  }
}

// Configure middleware matcher
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/student/:path*',
    '/admin/:path*',
    '/superadmin/:path*',
    '/auth/:path*',
    '/(api(?!/public).*)'
  ]
}
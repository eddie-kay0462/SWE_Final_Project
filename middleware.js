/**
 * Supabase Auth middleware for Next.js
 * 
 * Handles session token refresh and role-based route protection
 * Updates the auth token in cookies and passes it to Server Components
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

const studentRoutes = [
  '/student',
]

const adminRoutes = [
  '/admin',
]

const superAdminRoutes = [
  '/superadmin',
]

/**
 * Creates a Supabase client for middleware use
 * 
 * @param {Object} cookies - The request cookies
 * @returns {Object} Supabase client instance
 */
const createClient = (cookies) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookies.get(name)?.value,
        set: () => {}, // No-op since we're in read-only mode in middleware
        remove: () => {}, // No-op since we're in read-only mode in middleware
      },
    }
  )
}

/**
 * Middleware function executed on each request
 * Updates session tokens and enforces route-based authorization
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {NextResponse} Modified response with updated cookies and redirect if needed
 */
export async function middleware(request) {
  try {
    // Refresh session if it exists
    const response = await updateSession(request)

    // For non-protected routes, just return the response with updated session
    const { pathname } = request.nextUrl
    
    // Skip auth check for non-protected routes
    if (!protectedRoutes.some(route => pathname.startsWith(route)) && 
        !studentRoutes.some(route => pathname.startsWith(route)) && 
        !adminRoutes.some(route => pathname.startsWith(route)) && 
        !superAdminRoutes.some(route => pathname.startsWith(route))) {
      return response
    }

    // For protected routes, check if the user is authenticated with the right role
    const supabase = createClient(request.cookies)
    const { data: { user } } = await supabase.auth.getUser()

    // If not authenticated, redirect to login
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check user role for role-specific routes
    const { data: userData } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', user.id)
      .single()

    const roleId = userData?.role_id || 0

    // Handle student routes
    if (studentRoutes.some(route => pathname.startsWith(route)) && roleId !== 3) {
      // Redirect non-students away from student routes
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Handle admin routes
    if (adminRoutes.some(route => pathname.startsWith(route)) && roleId !== 2 && roleId !== 1) {
      // Redirect non-admins away from admin routes
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Handle super admin routes
    if (superAdminRoutes.some(route => pathname.startsWith(route)) && roleId !== 1) {
      // Redirect non-super-admins away from super admin routes
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    // If there's an error, proceed without blocking the request
    return NextResponse.next()
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Static files (_next/static, favicon.ico, etc.)
     * - Image optimization files
     * - API routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/public).*)',
  ],
}
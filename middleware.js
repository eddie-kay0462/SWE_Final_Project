/**
 * Supabase Auth middleware for Next.js
 * 
 * <p>Handles session token refresh and role-based route protection.
 * Updates the auth token in cookies and passes it to Server Components.</p>
 * 
 * @author Nana Amoako
 * @version 1.1.0
 */

import { NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// Define role IDs for easier reference
const ROLE_IDS = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  STUDENT: 3
}

// Define routes that require authentication and role-specific access
const protectedRoutes = [
  '/dashboard',
]

// Define role-specific route patterns
const studentRoutePatterns = [
  '/dashboard/student'
]

const adminRoutePatterns = [
  '/dashboard/admin'
]

const superAdminRoutePatterns = [
  '/dashboard/super-admin'
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
 * Checks if a path matches any of the patterns
 * 
 * @param {string} path - The path to check
 * @param {Array<string>} patterns - Array of route patterns to match against
 * @returns {boolean} True if the path matches any pattern
 */
function matchesRoutePatterns(path, patterns) {
  return patterns.some(pattern => path.startsWith(pattern))
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

    // Extract path from request
    const { pathname } = request.nextUrl
    
    // Skip auth check for non-protected routes
    if (!protectedRoutes.some(route => pathname.startsWith(route))) {
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

    // Check route access based on patterns and user role
    
    // Check student routes - only students and higher roles can access
    if (matchesRoutePatterns(pathname, studentRoutePatterns)) {
      if (![ROLE_IDS.STUDENT, ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN].includes(roleId)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Check admin routes - only admins and super admins can access
    if (matchesRoutePatterns(pathname, adminRoutePatterns)) {
      if (![ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN].includes(roleId)) {
        // If the user is a student, redirect to student dashboard
        if (roleId === ROLE_IDS.STUDENT) {
          return NextResponse.redirect(new URL('/dashboard/student', request.url))
        }
        // Otherwise redirect to homepage
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Check super admin routes - only super admins can access
    if (matchesRoutePatterns(pathname, superAdminRoutePatterns)) {
      if (roleId !== ROLE_IDS.SUPER_ADMIN) {
        // If the user is an admin, redirect to admin dashboard
        if (roleId === ROLE_IDS.ADMIN) {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url))
        }
        // If the user is a student, redirect to student dashboard
        if (roleId === ROLE_IDS.STUDENT) {
          return NextResponse.redirect(new URL('/dashboard/student', request.url))
        }
        // Otherwise redirect to homepage
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // If we reach here, the user is authorized to access the requested route
    return response
  } catch (error) {
    console.error('Middleware error:', error)
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
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/public|assets/).*)',
  ],
}
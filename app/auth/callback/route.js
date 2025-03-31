/**
 * Handles auth callback for Supabase authentication flows
 * Processes the auth callback and redirects the user to the appropriate page
 * 
 * @route GET /auth/callback
 * @param {Object} request - The request object with authentication parameters
 * @returns {Response} Redirect response to the appropriate dashboard based on user role
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const reqCookies = {}
    const supabase = await createClient(reqCookies)
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get the user to determine their role for redirection
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      // Redirect to login if there's an error
      return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
    }
    
    // Fetch user role from our custom table
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', user.id)
      .single()
    
    // Create response with cookies
    const response = NextResponse.redirect(new URL('/', requestUrl.origin))
    
    // Transfer cookies
    Object.entries(reqCookies).forEach(([name, value]) => {
      response.cookies.set(name, value)
    })
    
    // Redirect based on role
    if (!roleError && userData) {
      switch (userData.role_id) {
        case 1:
          return NextResponse.redirect(new URL('/superadmin/dashboard', requestUrl.origin))
        case 2:
          return NextResponse.redirect(new URL('/admin/dashboard', requestUrl.origin))
        case 3:
          return NextResponse.redirect(new URL('/student/dashboard', requestUrl.origin))
        default:
          return response
      }
    }
    
    return response
  }
  
  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
} 
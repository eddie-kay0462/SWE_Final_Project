/**
 * Handles user sign out by clearing the Supabase session
 * 
 * @route POST /api/auth/signout
 * @returns {Object} Response with success status or error message
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create response
    const response = NextResponse.json(
      { message: 'User signed out successfully' },
      { status: 200 }
    )

    // Clear auth cookies from the response
    Object.entries(reqCookies).forEach(([name, value]) => {
      response.cookies.set(name, '', { maxAge: 0 })
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
} 
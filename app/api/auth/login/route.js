/**
 * Handles user login authentication and role-based redirection
 * 
 * @route POST /api/auth/login
 * @param {Object} request - The request object containing login credentials
 * @returns {Object} Response with user data, session, and redirect path based on role
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Validate Ashesi email domain
    const [username, domain] = email.split('@')
    if (domain !== 'ashesi.edu.gh' && domain !== 'aucampus.onmicrosoft.com') {
      return NextResponse.json(
        { error: 'Only Ashesi email addresses are allowed (ashesi.edu.gh or aucampus.onmicrosoft.com)' },
        { status: 400 }
      )
    }

    // First check if the user exists in the users table by email
    const { data: publicUserData, error: publicUserError } = await supabase
      .from('users')
      .select('id, student_id, fname, lname, role_id, email')
      .eq('email', email)
      .single()
    
    // If no error at this point, authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    // If we don't have public user data or there was an error finding it
    if (publicUserError || !publicUserData) {
      // Fall back to checking the users table by auth ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role_id, fname, lname, student_id')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) {
        return NextResponse.json(
          { error: 'User profile not found. Please contact support.' },
          { status: 404 }
        )
      }

      // We found the user in the regular users table
      return createSuccessResponse(authData, userData, reqCookies)
    }

    // We found the user in users table by email
    return createSuccessResponse(authData, publicUserData, reqCookies)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

// Helper function to create a success response
function createSuccessResponse(authData, userData, reqCookies) {
  // Determine redirect path based on role
  let redirectPath
  switch (userData.role_id) {
    case 1:
      redirectPath = '/dashboard/super-admin' // Super Admin
      break
    case 2:
      redirectPath = '/dashboard/admin' // Admin/Staff
      break
    case 3:
      redirectPath = '/dashboard/student' // Student
      break
    default:
      redirectPath = '/' // Default
  }

  // Create response with cookies set by the Supabase client
  const response = NextResponse.json({
    user: {
      id: userData.id,
      email: authData.user.email,
      firstName: userData.fname,
      lastName: userData.lname,
      studentId: userData.student_id,
      roleId: userData.role_id
    },
    redirectPath
  })

  // Transfer cookies from Supabase response to our response
  Object.entries(reqCookies).forEach(([name, value]) => {
    response.cookies.set(name, value)
  })

  return response
}

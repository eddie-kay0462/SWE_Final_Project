/**
 * Retrieves the current authenticated user's information
 * 
 * @route GET /api/auth/user
 * @returns {Object} Response with user data and role-specific information
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Get the current user from Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch additional user details from our custom table
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('id, fname, lname, email, student_id, role_id, profilepic')
      .eq('id', user.id)
      .single()

    if (userDataError) {
      return NextResponse.json(
        { error: 'Error fetching user profile' },
        { status: 500 }
      )
    }

    // Determine user type and related information based on role
    let userType = 'unknown'
    switch (userData.role_id) {
      case 1:
        userType = 'superadmin'
        break
      case 2:
        userType = 'admin'
        break
      case 3:
        userType = 'student'
        break
    }

    // Return user information
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: userData.fname,
      lastName: userData.lname,
      studentId: userData.student_id,
      roleId: userData.role_id,
      userType: userType,
      profilePic: userData.profilepic,
      emailVerified: user.email_confirmed_at !== null
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
} 
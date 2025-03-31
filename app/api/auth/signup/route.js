/**
 * Handles user registration for both students and staff/admin
 * 
 * @route POST /api/auth/signup
 * @param {Object} request - The request object containing user signup data
 * @returns {Object} Response with success status or error message
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
export async function POST(req) {
  try {
    const { email, password, firstName, lastName, studentId, role } = await req.json()
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Validate Ashesi email domain by splitting at @ and checking domain
    const [username, domain] = email.split('@')
    if (domain !== 'ashesi.edu.gh' && domain !== 'aucampus.onmicrosoft.com') {
      return NextResponse.json(
        { error: 'Only Ashesi email addresses are allowed (ashesi.edu.gh or aucampus.onmicrosoft.com)' },
        { status: 400 }
      )
    }

    // Determine role_id
    const roleId = role === 'admin' ? 2 : 3 // Default to student (3) if not admin

    // Validate studentId format if role is student
    if (roleId === 3) {
      if (!studentId) {
        return NextResponse.json(
          { error: 'Student ID is required for student accounts' },
          { status: 400 }
        )
      }
      
      // Validate student ID pattern (XXXX20XX)
      const studentIdPattern = /^\d{4}20\d{2}$/
      if (!studentIdPattern.test(studentId)) {
        return NextResponse.json(
          { error: 'Invalid Student ID format. Expected format: XXXX20XX' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists in users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('User already exists in users table:', existingUser)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          student_id: studentId || null,
          role_id: roleId
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    console.log('User created in Auth:', authData.user.id)

    // Create service role client for database operations
    const serviceRoleClient = await createClient(reqCookies, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Prepare user data for insertion
    const userData = {
      id: authData.user.id,
      email: email,
      fname: firstName,
      lname: lastName,
      student_id: studentId || null,
      role_id: roleId,
      password: 'hashed_by_supabase' // The actual password is managed by Supabase Auth
    }

    console.log('Inserting user into users table:', userData)

    // Insert the user into our custom users table using service role client
    // This is because Supabase Auth doesn't store custom fields like student_id in its main users table
    const { data: insertData, error: insertError } = await serviceRoleClient
      .from('users')
      .insert(userData)
      .select()

    if (insertError) {
      console.error('Error inserting user into users table:', insertError)
      
      // Try to clean up the auth user since the database insert failed
      try {
        const { error: deleteError } = await serviceRoleClient.auth.admin.deleteUser(authData.user.id)
        if (deleteError) {
          console.error('Error cleaning up auth user after failed insert:', deleteError)
        }
      } catch (cleanupError) {
        console.error('Exception cleaning up auth user:', cleanupError)
      }
      
      // Return error to client
      return NextResponse.json(
        { error: 'Error creating user profile: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('User successfully inserted into users table')
    
    return NextResponse.json(
      {
        message: 'User created successfully. Please check your email for verification.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role_id: roleId
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup process error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

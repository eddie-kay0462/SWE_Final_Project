/**
 * Handles sending invitation emails to new staff/admin users
 * Uses Supabase Auth Admin API which requires server-side execution
 * 
 * @route POST /api/auth/invite
 * @param {Object} request - The request object containing the email to invite
 * @returns {Object} Response with success status or error message
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email } = await req.json()
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Verify that the current user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if the current user has admin privileges
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminData || (adminData.role_id !== 1 && adminData.role_id !== 2)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can send invitations' },
        { status: 403 }
      )
    }

    // Validate Ashesi email domain
    const [username, domain] = email.split('@')
    if (domain !== 'ashesi.edu.gh' && domain !== 'aucampus.onmicrosoft.com') {
      return NextResponse.json(
        { error: 'Only Ashesi email addresses are allowed (ashesi.edu.gh or aucampus.onmicrosoft.com)' },
        { status: 400 }
      )
    }

    // Create a service role client for admin operations
    // Note: This assumes you've set up SUPABASE_SERVICE_ROLE_KEY in your environment
    // This should never be exposed to the client
    const adminAuthClient = createClient(reqCookies, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Send invitation email (this requires a service role key)
    const { data, error: inviteError } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept-invite`,
      data: {
        role_id: 2, // Default to staff/admin role
      }
    })

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Invitation sent successfully',
        user: data.user
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
} 
/**
 * Admin invitation API endpoint
 * Allows admin users to send invitations to new staff members
 * 
 * @route POST /api/auth/admin/invite
 * @param {Object} request - The request object containing email to invite
 * @returns {Object} Response with success status or error message
 */

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email } = await req.json()
    const reqCookies = {}
    const supabase = await createClient(reqCookies)

    // Verify that the current user is logged in and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if the current user has admin privileges (role_id 1 or 2)
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminData || (adminData.role_id !== 1 && adminData.role_id !== 2)) {
      return NextResponse.json(
        { error: 'Only administrators can send invitations' },
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

    // Check if the email already exists in the system
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Use service role key to create admin client for admin operations
    const supabaseAdmin = await createClient(reqCookies, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Send invitation email
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/accept-invite`,
      data: {
        role_id: 2, // Staff/Admin role
      }
    })

    if (inviteError) {
      return NextResponse.json(
        { error: inviteError.message },
        { status: 400 }
      )
    }

    // Record the invitation in the database if needed
    // This could be used to track pending invitations or for audit purposes
    
    return NextResponse.json({
      message: `Invitation sent to ${email}`,
      user: data.user
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
} 
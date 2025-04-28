import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * POST handler for recording event attendance
 * 
 * @returns {Promise<NextResponse>} JSON response indicating success or failure
 */
export async function POST(request) {
  try {
    // Create a Supabase client
    const supabase = await createClient();
    
    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Parse the request body
    const { token, studentId } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get the student's ID from the users table if not provided
    let verifiedStudentId = studentId;
    if (!verifiedStudentId) {
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userDataError || !userData) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      verifiedStudentId = userData.id;
    }

    // Verify the token and get event details
    const { data: tokenData, error: tokenError } = await supabase
      .from('attendance_tokens')
      .select('*, career_sessions(*)')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (tokenData.used_at) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      );
    }

    // If studentId was provided, verify it matches the token
    if (studentId && tokenData.student_id !== studentId) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Record the attendance
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .insert([
        {
          student_id: verifiedStudentId,
          event_id: tokenData.event_id,
          checked_in_at: new Date().toISOString()
        }
      ]);

    if (attendanceError) {
      console.error('Error recording attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    // Mark the token as used
    const { error: updateError } = await supabase
      .from('attendance_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error('Error updating token:', updateError);
      // Don't return error since attendance was already recorded
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      eventDetails: tokenData.career_sessions
    });

  } catch (error) {
    console.error('Error in check-in API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
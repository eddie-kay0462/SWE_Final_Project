import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Generates a secure hash for attendance tracking
 * 
 * @param {string} studentId - The student's ID
 * @param {string} eventId - The event's ID
 * @param {string} eventTime - The event's time
 * @returns {string} The hashed token
 */
function generateAttendanceToken(studentId, eventId, eventTime) {
  const combinedString = `${studentId}-${eventId}-${eventTime}`;
  return crypto
    .createHash('sha256')
    .update(combinedString)
    .digest('hex');
}

/**
 * GET handler for generating QR code data for a specific event
 * 
 * @returns {Promise<NextResponse>} JSON response with QR code data
 */
export async function GET(request) {
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

    // Get the event ID from the URL params
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get the student's ID from the users table
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

    // Get the event details
    const { data: event, error: eventError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Generate the attendance token
    const token = generateAttendanceToken(
      userData.id,
      eventId,
      `${event.date} ${event.start_time}`
    );

    // Store the token in the database
    const { error: tokenError } = await supabase
      .from('attendance_tokens')
      .upsert([
        {
          token,
          student_id: userData.id,
          event_id: eventId,
          expires_at: new Date(event.date + ' ' + event.end_time),
          created_at: new Date().toISOString()
        }
      ]);

    if (tokenError) {
      console.error('Error storing token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to generate attendance token' },
        { status: 500 }
      );
    }

    // Return the QR code data
    return NextResponse.json({
      qrUrl: `https://csoft-vert.vercel.app/checkin?token=${token}`,
      expiresAt: new Date(event.date + ' ' + event.end_time).toISOString()
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET handler for fetching attendance records for a specific event
 * 
 * @param {Request} request - The incoming request object
 * @param {{ params: Promise<{ session_id: string }> }} context - The context object containing params promise
 * @returns {Promise<Response>} JSON response with attendance data
 */
export async function GET(
  request,
  context
) {
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

    // Get the session ID from params promise
    const { session_id } = await context.params;
    
    if (!session_id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fetch attendance records with student details using the attendance table
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        id,
        session_id,
        student_id,
        signup_time,
        users!inner (
          id,
          fname,
          lname,
          email,
          student_id
        )
      `)
      .eq('session_id', session_id)
      .order('signup_time', { ascending: true });

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    // Debug: Log the first record to see the timestamp format
    if (attendanceRecords && attendanceRecords.length > 0) {
      console.log('First record signup_time:', attendanceRecords[0].signup_time);
      console.log('Raw record:', JSON.stringify(attendanceRecords[0], null, 2));
    }

    // Format the attendance data with check-in time
    const formattedRecords = attendanceRecords.map(record => {
      // Parse the ISO timestamp
      const date = new Date(record.signup_time);
      
      // Format the time as "h:mm AM/PM"
      const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      
      // Format the date as "D MMM YYYY"
      const dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };

      return {
        id: record.id,
        studentId: record.users.student_id,
        studentName: `${record.users.fname} ${record.users.lname}`,
        email: record.users.email,
        checkedInAt: date.toLocaleTimeString('en-US', timeOptions),
        checkedInDate: date.toLocaleDateString('en-US', dateOptions)
      };
    });

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (eventError) {
      console.error('Error fetching event details:', eventError);
      return NextResponse.json(
        { error: 'Failed to fetch event details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      event: {
        id: event.session_id,
        title: event.title,
        date: new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: `${event.start_time} - ${event.end_time}`,
        location: event.location
      },
      attendanceCount: formattedRecords.length,
      records: formattedRecords
    });

  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
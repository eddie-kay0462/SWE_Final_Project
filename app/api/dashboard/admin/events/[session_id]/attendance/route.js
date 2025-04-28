import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * GET handler for fetching attendance records for a specific event
 * 
 * @param {Request} request - The incoming request object
 * @param {object} context - The context object containing params
 * @returns {Promise<NextResponse>} JSON response with attendance data
 */
export async function GET(request, context) {
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

    // Get the session ID from the URL params
    const sessionId = context.params.session_id;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fetch attendance records with student details
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records')
      .select(`
        *,
        users:student_id (
          id,
          fname,
          lname,
          email,
          student_id
        )
      `)
      .eq('event_id', sessionId)
      .order('checked_in_at', { ascending: true });

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records' },
        { status: 500 }
      );
    }

    // Format the attendance data
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      studentId: record.users.student_id,
      studentName: `${record.users.fname} ${record.users.lname}`,
      email: record.users.email,
      checkedInAt: new Date(record.checked_in_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }));

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', sessionId)
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
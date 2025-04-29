import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * GET handler for retrieving event details and attendance
 * 
 * @param {Request} request - The incoming request object
 * @param {object} params - The route parameters containing the session_id
 * @returns {Promise<NextResponse>} JSON response with event and attendance details
 */
export async function GET(request, { params }) {
  try {
    const { session_id } = params;
    if (!session_id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Initialize Supabase client with cookies
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              // Handle cookie setting error
            }
          },
          remove(name, options) {
            try {
              cookieStore.delete(name, options)
            } catch (error) {
              // Handle cookie removal error
            }
          },
        },
      }
    );

    // First, get the event details
    const { data: event, error: eventError } = await supabase
      .from('career_sessions')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      return NextResponse.json(
        { error: "Failed to fetch event" },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Then, get attendance records with student details
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select(`
        id,
        signup_time,
        users!attendance_student_id_fkey (
          student_id,
          fname,
          lname,
          email
        )
      `)
      .eq('session_id', session_id);

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
      return NextResponse.json(
        { error: "Failed to fetch attendance records" },
        { status: 500 }
      );
    }

    // Format the attendance records
    const formattedAttendance = attendanceRecords.map(record => ({
      id: record.id,
      student: {
        id: record.users.student_id,
        name: `${record.users.fname} ${record.users.lname}`,
        email: record.users.email
      },
      checkedInAt: new Date(record.signup_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    }));

    // Format the event data
    const eventData = {
      id: event.session_id,
      title: event.title,
      date: new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: `${event.start_time} - ${event.end_time}`,
      location: event.location,
      description: event.description,
      attendees: {
        count: formattedAttendance.length,
        records: formattedAttendance
      }
    };

    return NextResponse.json(eventData);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
} 
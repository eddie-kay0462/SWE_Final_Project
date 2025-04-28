import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * POST handler for recording event attendance
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with attendance status
 */
export async function POST(request) {
  try {
    // Initialize Supabase client with cookies
    const cookieStore = cookies();

    // Create a synchronous cookie handler
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

    // Get the student ID and session ID from the request body
    const { studentId, sessionId } = await request.json();

    if (!studentId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Looking up event with session_id:", sessionId);

    // Check if the event exists in career_sessions
    const { data: event, error: eventError } = await supabase
      .from("career_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (eventError) {
      console.error("Event lookup error:", eventError);
      return NextResponse.json(
        { error: "Failed to lookup event" },
        { status: 500 }
      );
    }

    if (!event) {
      console.error("Event not found for session_id:", sessionId);
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Verify student exists in users table
    const { data: student, error: studentError } = await supabase
      .from("users")
      .select("fname, lname, student_id")
      .eq("student_id", studentId)
      .single();

    if (studentError) {
      console.error("Student lookup error:", studentError);
      return NextResponse.json(
        { error: "Failed to lookup student" },
        { status: 500 }
      );
    }

    if (!student) {
      console.error("Student not found for ID:", studentId);
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if attendance already exists
    const { data: existingAttendance, error: checkError } = await supabase
      .from("attendance")
      .select("*")
      .eq("session_id", sessionId)
      .eq("student_id", studentId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Attendance check error:", checkError);
      return NextResponse.json(
        { error: "Failed to check existing attendance" },
        { status: 500 }
      );
    }

    if (existingAttendance) {
      return NextResponse.json(
        { error: "You have already checked in for this event" },
        { status: 400 }
      );
    }

    // Record attendance in the attendance table
    const { error: insertError } = await supabase
      .from("attendance")
      .insert([
        {
          session_id: sessionId,
          student_id: studentId,
          signup_time: new Date().toISOString()
        }
      ]);

    if (insertError) {
      console.error("Attendance insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to record attendance" },
        { status: 500 }
      );
    }

    // Return success response with event and user details
    return NextResponse.json(
      {
        message: "Attendance recorded successfully",
        event: {
          id: event.session_id,
          title: event.title,
          date: event.date
        },
        user: {
          name: `${student.fname} ${student.lname}`,
          student_id: student.student_id
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing attendance:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
} 
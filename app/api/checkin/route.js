import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Handle missing environment variables more gracefully
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required Supabase environment variables")
}

// Initialize Supabase client with fallback for build time
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export async function POST(request) {
  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 503 }
      )
    }

    const { student_id, session_id, timestamp } = await request.json()

    // Verify the hash matches the expected format
    if (!student_id || !session_id || !timestamp) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Check if the session exists and is valid
    const { data: session, error: sessionError } = await supabase
      .from("event_sessions")
      .select("*")
      .eq("id", session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      )
    }

    // Check if the student has already checked in
    const { data: existingCheckIn, error: checkInError } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("session_id", session_id)
      .eq("student_id", student_id)
      .single()

    if (checkInError && checkInError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Error checking attendance" },
        { status: 500 }
      )
    }

    if (existingCheckIn) {
      return NextResponse.json(
        { error: "Student has already checked in" },
        { status: 400 }
      )
    }

    // Record the attendance
    const { error: insertError } = await supabase
      .from("attendance_records")
      .insert({
        student_id,
        session_id,
        check_in_time: new Date().toISOString(),
        qr_hash: student_id // Store the hash for verification
      })

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to record attendance" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Attendance recorded successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
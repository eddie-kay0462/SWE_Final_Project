import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST handler for recording student attendance
 * 
 * @param {Request} request - The incoming request object
 * @returns {Promise<NextResponse>} JSON response confirming attendance
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { studentId, token } = await request.json();

    if (!studentId || !token) {
      return NextResponse.json(
        { error: 'Student ID and token are required' },
        { status: 400 }
      );
    }

    // Get the QR code and event details
    const { data: qrCode, error: qrError } = await supabase
      .from('event_qr_codes')
      .select('event_id, expires_at')
      .eq('token', token)
      .single();

    if (qrError || !qrCode) {
      return NextResponse.json(
        { error: 'Invalid or expired QR code' },
        { status: 404 }
      );
    }

    // Check if the QR code has expired
    if (new Date(qrCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This QR code has expired' },
        { status: 410 }
      );
    }

    // Verify the student exists
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 404 }
      );
    }

    // Check if student has already checked in
    const { data: existingRecord, error: recordError } = await supabase
      .from('attendance_records')
      .select('id')
      .match({
        student_id: student.id,
        event_id: qrCode.event_id
      })
      .single();

    if (existingRecord) {
      return NextResponse.json(
        { error: 'You have already checked in to this event' },
        { status: 409 }
      );
    }

    // Record the attendance
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        student_id: student.id,
        event_id: qrCode.event_id,
        checked_in_at: new Date().toISOString()
      });

    if (attendanceError) {
      console.error('Error recording attendance:', attendanceError);
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    // Update the event's attendance count
    const { error: updateError } = await supabase.rpc('increment_event_attendance', {
      event_id: qrCode.event_id
    });

    if (updateError) {
      console.error('Error updating attendance count:', updateError);
      // Don't return an error since the attendance was recorded successfully
    }

    return NextResponse.json({
      message: 'Attendance recorded successfully'
    });

  } catch (error) {
    console.error('Error in attendance check-in:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 